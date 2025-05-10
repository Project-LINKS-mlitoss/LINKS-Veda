from typing import Annotated, Literal

from langgraph.graph.message import add_messages
from pydantic import BaseModel, Field
from typing_extensions import TypedDict


class AgentState(BaseModel):
    """Agent state."""

    messages: Annotated[list, add_messages]


class RouteQuery(BaseModel):
    """Route a user query to the most relevant datasource."""

    datasource: Literal["vectorstore", "dataframe", "other"] = Field(
        ...,
        description="Given a user question choose to route it to a vectorstore or a dataframe or other.",  # noqa: E501
    )


class GradeDocuments(BaseModel):
    """Binary score for relevance check on retrieved documents."""

    binary_score: Literal["yes", "no"] = Field(
        description="Documents are relevant to the question, 'yes' or 'no'"
    )


class GradeHallucinations(BaseModel):
    """Binary score for hallucination present in generation answer."""

    binary_score: Literal["yes", "no"] = Field(
        description="Answer is grounded in the facts, 'yes' or 'no'"
    )


class GradeAnswer(BaseModel):
    """Binary score to assess answer addresses question."""

    binary_score: Literal["yes", "no"] = Field(
        description="Answer addresses the question, 'yes' or 'no'"
    )

class GradeReferDocWithAnswer(BaseModel):
    binary_score: Literal["yes", "no"] = Field(
        description="Document are relevant to the question and answer, 'yes' or 'no'"
    )

class GraphState(TypedDict):
    """Represents the state of our graph.

    Attributes :
        question: question
        generation: LLM generation
        documents: list of documents
    """

    question: str
    generation: str
    documents: list[str]
    file_ids: list[str]
    chunk_answers: list[str]