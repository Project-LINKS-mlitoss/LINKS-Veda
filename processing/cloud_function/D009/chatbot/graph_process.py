import asyncio
import os

import boto3
from langchain_aws.embeddings import BedrockEmbeddings
from langchain_google_community import BigQueryVectorStore

from chains import hallucination_grader, answer_grader, query_router, question_rewriter, document_grader, rag_chain, \
    llm, document_grader_with_answer, summary_rag_chain
from custom_types import GraphState
from concurrent.futures import ThreadPoolExecutor, as_completed
from prompts import prompt

AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID', '')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY', '')
REGION = os.getenv('REGION', 'asia-northeast1')
PROJECT_ID = os.getenv('PROJECT_ID', 'projectlinks')
DATASET_NAME = os.getenv('DATASET_NAME', '')

client = llm.client

def load_vector_store(model_id: str = "amazon.titan-embed-text-v2:0"):
    embeddings = load_embeddings(model_id)
    return BigQueryVectorStore(
        project_id=PROJECT_ID,
        dataset_name=DATASET_NAME,
        table_name="dms_vector_store_table_v1",
        location=REGION,
        embedding=embeddings
    )


def load_client():
    return boto3.client(
        "bedrock-runtime",
        region_name="ap-northeast-1",
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    )


def load_embeddings(model_id: str):
    return BedrockEmbeddings(
        client=load_client(),
        model_id=model_id,
    )


def retrieve(state: GraphState) -> GraphState:
    """Retrieve documents.

    Args :
    ----
        state (dict): The current graph state

    Returns :
    -------
        state (dict): New key added to state, documents, that contains retrieved documents
    """
    print("---RETRIEVE---")  # noqa: T201
    vectorstore = load_vector_store()
    question = state["question"]
    file_ids = state["file_ids"]
    if len(file_ids) > 1:
        filter_query = f"file_id in ({','.join(["'" + id.strip() + "'" for id in file_ids])})"
        documents = vectorstore.similarity_search(query=question, k=40, filter=filter_query)
    else:
        filter_query = f"file_id = '{file_ids[0].strip()}'"
        documents = vectorstore.similarity_search(query=question, k=40, filter=filter_query)

    # documents = vectorstore.similarity_search(query=question, k=40, filter=filter_query)
    print(f"---RETRIEVE {len(documents)} documents---")
    return {"documents": documents, "question": question}


def generate(state: GraphState) -> GraphState:
    """Generate answer.

    Args:
    ----
        state (dict): The current graph state

    Returns:
    -------
        state (dict): New key added to state, generation, that contains LLM generation

    """
    print("---GENERATE---")  # noqa: T201
    question = state["question"]

    if "documents" in state:
        documents = state["documents"]
        if not documents:
            return {"documents": documents, "question": question, "generation": "申し訳ありませんが、ご質問に適した情報が見つかりませんでした。\n別の質問を試すか、もう少し詳しい情報を提供していただけますか？"}

        # RAG generation
        chunk_answers = []
        try:
            chunk_docs = [documents[i: i + 2] for i in range(0, len(documents), 2)]
            with ThreadPoolExecutor() as executor:
                future_to_doc = {executor.submit(wrapper_llm_call, chunk, question) for chunk in chunk_docs}
                for future in as_completed(future_to_doc):
                    try:
                        chunk_answer = future.result()
                        chunk_answers.append(chunk_answer)
                    except Exception as e:
                        print(f"---ERROR GET LLM ANSWER: {e}---")
                        raise
            # chunk_answers = asyncio.run(asyncio.gather(*coroutines))
        except Exception as e:
            return {"question": question, "generation": str(e)}

        if len(chunk_answers) > 1:
            return {"documents": documents, "question": question, "chunk_answers": chunk_answers}
        else:
            return {"documents": documents, "question": question, "generation": chunk_answers[0]}

    generation = llm.invoke(question).content
    return {"question": question, "generation": generation}

def wrapper_llm_call(chunk, question):
    try:
        result = rag_chain.invoke({"context": chunk, "question": question})
        return result
    except client.exceptions.ValidationException as e:
        ids = [d.metadata["doc_id"] for d in chunk]
        raw_prompt = prompt.format(context=chunk, question=question)
        tokens = llm.get_num_tokens(raw_prompt)
        print("LLM ERROR WHEN PROCESS DOCS: ", ids)
        print(e)
        raise Exception(f"Input too long with docs: {','.join(ids)} \nNumber tokens: {tokens}")

def summary_answers(state: GraphState) -> GraphState:
    print("---SUMMARY ANSWERS---")
    question = state["question"]
    chunk_answers = state.get("chunk_answers", [])
    if len(chunk_answers) > 0:
        print(f"---HAVE {len(chunk_answers)} NEED SUMMARY---")
        generation = summary_rag_chain.invoke({"answers": "\n\n".join(chunk_answers), "question": question})
        state["generation"] = generation
        return state
    return state

def grade_documents(state: GraphState) -> GraphState:
    """Determines whether the retrieved documents are relevant to the question.

    Args:
    ----
        state (dict): The current graph state

    Returns:
    -------
        state (dict): Updates documents key with only filtered relevant documents

    """
    print("---CHECK DOCUMENT RELEVANCE TO QUESTION---")  # noqa: T201
    question = state["question"]
    documents = state["documents"]

    filtered_docs = []
    if not documents:
        return {"documents": filtered_docs, "question": question}

    with ThreadPoolExecutor() as executor:
        future_to_doc = {executor.submit(document_grader.invoke, {"question": question, "document": d.page_content}): d
                         for d in documents}
        for future in as_completed(future_to_doc):
            d = future_to_doc[future]
            try:
                score = future.result()
                grade = score.binary_score
                if grade == "yes":
                    print("---GRADE: DOCUMENT RELEVANT---")  # noqa: T201
                    filtered_docs.append(d)
                else:
                    print("---GRADE: DOCUMENT NOT RELEVANT---")  # noqa: T201
            except Exception as e:
                print(f"---ERROR processing document: {e}---")  # noqa: T201
    print(f"---GRADE DOC GOT {len(filtered_docs)} documents---")
    return {"documents": filtered_docs, "question": question}


def grade_documents_with_answer(state: GraphState) -> GraphState:
    print("---CHECK DOCUMENT RELEVANCE TO QUESTION AND ANSWER---")
    question = state["question"]
    documents = state.get("documents", [])
    answer = state["generation"]
    if len(documents) == 0:
        return state
    refer_docs = []
    with ThreadPoolExecutor() as executor:
        future_to_doc = {executor.submit(document_grader_with_answer.invoke,
                                         {"question": question, "document": d.page_content, "answer": answer}): d
                         for d in documents}
        for future in as_completed(future_to_doc):
            d = future_to_doc[future]
            try:
                score = future.result()
                grade = score.binary_score
                if grade == "yes":
                    print("---GRADE: DOCUMENT RELEVANT---")  # noqa: T201
                    refer_docs.append(d)
                else:
                    print("---GRADE: DOCUMENT NOT RELEVANT---")  # noqa: T201
            except Exception as e:
                print(f"---ERROR processing document: {e}---")
    print(f"---GRADE WITH ANSWER GOT {len(refer_docs)} documents---")
    return {"question": question, "generation": answer, "documents": refer_docs}


def transform_query(state: GraphState) -> GraphState:
    """Transform the query to produce a better question.

    Args:
    ----
        state (dict): The current graph state

    Returns:
    -------
        state (dict): Updates question key with a re-phrased question

    """

    print("---TRANSFORM QUERY---")  # noqa: T201
    question = state["question"]
    documents = state["documents"]

    # Re-write question
    better_question = question_rewriter.invoke({"question": question})
    return {"documents": documents, "question": better_question}


def route_question(state: GraphState) -> GraphState:
    """Route question to web search or RAG.

    Args:
    ----
        state (dict): The current graph state

    Returns:
    -------
        str: Next node to call
    """

    print("---ROUTE QUESTION---")  # noqa: T201
    question = state["question"]
    source = query_router.invoke({"question": question})
    if source.datasource == "other":
        print("---ROUTE QUESTION TO OTHER---")  # noqa: T201
        return "other"
    elif source.datasource == "dataframe":
        print("---ROUTE QUESTION TO DF RAG---")  # noqa: T201
        # if len(file_ids) > 1:
        #     return "vectorstore"
        # else:
        #     return "dataframe"
        return "vectorstore"
    elif source.datasource == "vectorstore":
        print("---ROUTE QUESTION TO VECTOR RAG---")  # noqa: T201
        return "vectorstore"


def decide_to_generate(state: GraphState) -> GraphState:
    """Determines whether to generate an answer, or re-generate a question.

    Args:
    ----
        state (dict): The current graph state

    Returns:
    -------
        str: Binary decision for next node to call
    """

    print("---ASSESS GRADED DOCUMENTS---")  # noqa: T201
    state["question"]
    filtered_documents = state["documents"]

    if not filtered_documents:
        # All documents have been filtered check_relevance
        # We will re-generate a new query
        print(  # noqa: T201
            "---DECISION: ALL DOCUMENTS ARE NOT RELEVANT TO QUESTION, TRANSFORM QUERY---"  # noqa: T201
        )
        return "transform_query"
    # We have relevant documents, so generate answer
    print("---DECISION: GENERATE---")  # noqa: T201
    return "generate"


def grade_generation_v_documents_and_question(state: GraphState) -> GraphState:
    """
    Determines whether the generation is grounded in the document and answers question.

    Args:
        state (dict): The current graph state

    Returns:
        str: Decision for next node to call
    """

    print("---CHECK HALLUCINATIONS---")  # noqa: T201
    question = state["question"]
    documents = state["documents"]
    generation = state["generation"]

    score = hallucination_grader.invoke(
        {"documents": documents, "generation": generation}
    )
    grade = score.binary_score

    # Check hallucination
    if grade == "yes":
        print("---DECISION: GENERATION IS GROUNDED IN DOCUMENTS---")  # noqa: T201
        # Check question-answering
        print("---GRADE GENERATION vs QUESTION---")  # noqa: T201
        score = answer_grader.invoke({"question": question, "generation": generation})
        grade = score.binary_score
        if grade == "yes":
            print("---DECISION: GENERATION ADDRESSES QUESTION---")  # noqa: T201
            return "useful"
        else:
            print("---DECISION: GENERATION DOES NOT ADDRESS QUESTION---")  # noqa: T201
            return "not useful"
    else:
        print("---DECISION: GENERATION IS NOT GROUNDED IN DOCUMENTS, RE-TRY---")  # noqa: T201
        return "not supported"
