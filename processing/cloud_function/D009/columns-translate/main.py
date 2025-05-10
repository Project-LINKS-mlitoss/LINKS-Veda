import time
from typing import List

from langchain_core.prompts import PromptTemplate, HumanMessagePromptTemplate, AIMessagePromptTemplate, \
    ChatPromptTemplate
from llm import LLMChat
from langchain_core.runnables import RunnablePassthrough
from pydantic import BaseModel, Field
from flask import jsonify, make_response
import json

RAG_TEMPLATE = """
I will provide you with JSON data that is a list of objects, each describing a column name in Japanese (jp_name field) and the column's description (description field).
Your task is to add an en_name field to each object, where the value is the English name of the column, generated based on the jp_name and description fields.
Note:
1. The English name must be in snake_case format.
2. The English name should not contain uppercase letters.
3. You must remove property description. The object property only jp_name and en_name
{columns_data}


{schema}

"""

class TranslateColumns(BaseModel):
    en_name: str = Field(description="English name of the column")
    jp_name: str = Field(description="Input japanese name, please keep it same as input dont change value")

class LlmOutput(BaseModel):
    data: list[TranslateColumns] = []

class RequestBody(BaseModel):
    columns: List[dict]

from custom_output import CustomJsonOutputParser
def get_rag_chain():
    output_parser = CustomJsonOutputParser(pydantic_object=LlmOutput)
    input_prompt = PromptTemplate(template=RAG_TEMPLATE, input_variables=["columns_data"], partial_variables={"schema": output_parser.get_format_instructions()})
    user_message_prompt = HumanMessagePromptTemplate(prompt=input_prompt)
    assistant_message_prompt = AIMessagePromptTemplate.from_template(template="{{")
    prompt = ChatPromptTemplate.from_messages([user_message_prompt, assistant_message_prompt])
    llm = LLMChat("anthropic.claude-3-haiku-20240307-v1:0")

    return (
            {"columns_data": RunnablePassthrough()}
            | prompt
            | llm
            | output_parser
    )
def send_response(data, status=200):
    return make_response(jsonify(data), status)

def columns_translate(request):
    data = request.get_json()
    print('[COLUMNS TRANSLATE][INCOMING REQUEST]', data)
    
    columns = data["columns"]
    chain = get_rag_chain()
    count_retries = 1
    results = []
    for i in range(0, len(columns), 15):
        chunk = columns[i : i + 15]
        while True:
            try:
                llm_res = chain.invoke(json.dumps(chunk))
                result = llm_res.get("data", [])
                results.extend(result)
                break
            except Exception as e:
                print(f"[COLUMNS TRANSLATE] try {count_retries}th Error: ", e)
                count_retries += 1
                if count_retries > 5:
                    break
                time.sleep(60)

    response = {
        "status": "ok",
        "data": results
    }
    return send_response(response)
