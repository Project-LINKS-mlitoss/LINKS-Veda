from langchain_core.output_parsers import StrOutputParser

from llm import LLMChat
from prompts import grade_hallucinations_prompt, grade_documents_prompt, grade_answer_prompt, route_query_prompt, \
    question_rewrite_prompt, prompt, grade_documents_with_answer_prompt, summary_answers_prompt
from custom_types import GradeHallucinations, GradeDocuments, GradeAnswer, RouteQuery, GradeReferDocWithAnswer

llm = LLMChat("anthropic.claude-3-5-sonnet-20241022-v2:0")
hallucination_grader = grade_hallucinations_prompt | llm.with_structured_output(GradeHallucinations) # noqa: E501
document_grader = grade_documents_prompt | llm.with_structured_output(GradeDocuments)
document_grader_with_answer = grade_documents_with_answer_prompt | llm.with_structured_output(GradeReferDocWithAnswer)
answer_grader = grade_answer_prompt | llm.with_structured_output(GradeAnswer)
query_router = route_query_prompt | llm.with_structured_output(RouteQuery)
question_rewriter = question_rewrite_prompt | llm | StrOutputParser()
rag_chain = prompt | llm | StrOutputParser()
summary_rag_chain = summary_answers_prompt | llm | StrOutputParser()