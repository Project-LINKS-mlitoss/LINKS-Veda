from langchain_core.prompts import ChatPromptTemplate, HumanMessagePromptTemplate, PromptTemplate
route_query_system_prompt = """You are an expert at routing a user question to a vectorstore or dataframe.
The vectorstore and dataframe contains documents related to policy evaluation.
For questions that are too complex for vector search—such as questions like "～の政策目標を全て答えてください", where only the top search results are insufficient—use the dataframe.
Otherwise, use the vectorstore.
For questions that do not require using either vectorstore or dataframe (for example, greetings like "こんにちは"), select 'other'."""  # noqa: E501, RUF001
route_query_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", route_query_system_prompt),
        ("human", "{question}"),
    ]
)


grade_documents_system_prompt = """You are a grader assessing relevance of a retrieved document to a user question. \n
If the document contains keyword(s) or semantic meaning related to the user question, grade it as relevant. \n
It does not need to be a stringent test. The goal is to filter out erroneous retrievals. \n
Give a binary score 'yes' or 'no' score to indicate whether the document is relevant to the question."""  # noqa: E501
grade_documents_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", grade_documents_system_prompt),
        ("human", "Retrieved document: \n\n {document} \n\n User question: {question}"),
    ]
)


grade_documents_with_answer_system_prompt = """You are an expert in semantic analysis.\n
I will provide you with a question, an AI-generated answer, and a document.\n
Your task is to assess whether the document is relevant to both the question and the answer.  
Give a binary score 'yes' or 'no' score to indicate whether the document is relevant to the question and answer
"""
grade_documents_with_answer_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", grade_documents_with_answer_system_prompt),
        ("human", "User question: {question}\n\n AI-generated answer: {answer}\n\nDocument: {document}"),
    ]
)


grade_hallucinations_system_prompt = """You are a grader assessing whether an LLM generation is grounded in / supported by a set of retrieved facts. \n
Give a binary score 'yes' or 'no'. 'Yes' means that the answer is grounded in / supported by the set of facts."""  # noqa: E501
grade_hallucinations_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", grade_hallucinations_system_prompt),
        ("human", "Set of facts: \n\n {documents} \n\n LLM generation: {generation}"),
    ]
)


grade_answer_system_prompt = """You are a grader assessing whether an answer addresses / resolves a question \n
Give a binary score 'yes' or 'no'. Yes' means that the answer resolves the question."""  # noqa: E501
grade_answer_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", grade_answer_system_prompt),
        ("human", "User question: \n\n {question} \n\n LLM generation: {generation}"),
    ]
)


question_rewrite_system_prompt = """You a question re-writer that converts an input question to a better version that is optimized \n
for vectorstore retrieval. Look at the input and try to reason about the underlying semantic intent / meaning."""  # noqa: E501
question_rewrite_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", question_rewrite_system_prompt),
        (
            "human",
            "Here is the initial question: \n\n {question} \n Formulate an improved question.",  # noqa: E501
        ),
    ]
)


prompt = ChatPromptTemplate(
    input_variables=['context', 'question'],
    input_types={},
    partial_variables={},
    metadata={},
    messages=[
        HumanMessagePromptTemplate(
            prompt=PromptTemplate(
                input_variables=['context', 'question'],
                input_types={},
                partial_variables={},
                template="You are an assistant for question-answering tasks. Use the entire retrieved context without omitting any details to answer the question. When presenting the answer, ensure that target names such as policy goals and law names (e.g., regulation or legal framework names) are fully included along with detailed explanations without truncation. If you don't know the answer, just say that you don't know. Question: {question} Context: {context} Answer:",
            ),
            additional_kwargs={}
        )
    ]
)

summary_answers_system_prompt = """Below are answers of question from different chunks of the document.
Please summarize them into a complete, accurate, and coherent answer.
Remove redundant information and keep only the most relevant details.
If there are conflicting responses, prioritize the most detailed and logical ones.

Question:
{question}

Responses from different chunks:
{answers}
"""
summary_answers_prompt = ChatPromptTemplate(
    input_variables=['answers', 'question'],
    input_types={},
    partial_variables={},
    metadata={},
    messages=[
        HumanMessagePromptTemplate(
            prompt=PromptTemplate(
                input_variables=['answers', 'question'],
                input_types={},
                partial_variables={},
                template=summary_answers_system_prompt,
            ),
            additional_kwargs={}
        )
    ]
)