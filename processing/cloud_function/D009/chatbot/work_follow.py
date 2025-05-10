from langgraph.graph import END, StateGraph, START

from graph_process import route_question, transform_query, generate, grade_documents, retrieve, \
    grade_documents_with_answer, summary_answers
from custom_types import GraphState

workflow = StateGraph(GraphState)

# Define the nodes
workflow.add_node("retrieve", retrieve)  # retrieve
workflow.add_node("grade_documents", grade_documents)  # grade documents
workflow.add_node("generate", generate)  # generatae
workflow.add_node("summary_answers", summary_answers) # Summary chunk answers
workflow.add_node("grade_documents_with_anwser", grade_documents_with_answer)
# workflow.add_node("transform_query", transform_query)  # transform_query

# workflow.add_node("dataframe_analyzer", dataframe_analyzer)

# Build graph
workflow.add_conditional_edges(
    START,
    route_question,
    {
        "other": "generate",
        "vectorstore": "retrieve"
    },
)
# workflow.add_edge("retrieve", "generate") # 全てをスキップ
workflow.add_edge("retrieve", "grade_documents")
workflow.add_edge("grade_documents", "generate") # もしハルシネーションチェックを入れる場合はこれをコメントアウト # noqa: E501, ERA001


workflow.add_edge("generate", "summary_answers")
workflow.add_edge("summary_answers", "grade_documents_with_anwser")
workflow.add_edge("grade_documents_with_anwser", END)
# workflow.add_edge("dataframe_analyzer", "__end__")

# Compile
graph = workflow.compile()