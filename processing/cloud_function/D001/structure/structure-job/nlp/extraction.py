import asyncio
from collections.abc import Coroutine
from operator import itemgetter
from typing import Any, Type

from botocore.exceptions import ClientError
from langchain.output_parsers import ResponseSchema
from langchain_core.runnables import RunnablePassthrough
from nlp.llm import LLMChat
from pydantic import BaseModel
from langchain.prompts import HumanMessagePromptTemplate, AIMessagePromptTemplate, ChatPromptTemplate

def extract_json_with_schema(
        bedrock_model_id: str,
        json_schema: dict,
        additional_prompt: str,
        content: str,
) -> dict:
    llm = LLMChat(
        model_id=bedrock_model_id,
    )
    properties = json_schema["properties"]
    response_schemas = [
        ResponseSchema(
            name=name,
            type=properties[name]["type"],
            description=f"{properties[name]['description']}. Value of field must be in type {properties[name]['type']} or null",
        )
        for name in properties
    ]
    prompt, output_parser = llm.get_json_mode_prompt_parser(
        schemas=response_schemas,
        additional_prompt=additional_prompt,
    )
    chain = prompt | llm | output_parser
    return chain.invoke(content)



async def aextract_json_with_schema(
        bedrock_model_id: str,
        json_schema: dict,
        additional_prompt: str,
        content: str,
        prompt_type: str = "default",
        pydantic_model: Type[BaseModel] = None
):
    bedrock_model_ids = ["anthropic.claude-3-5-sonnet-20240620-v1:0", "anthropic.claude-3-haiku-20240307-v1:0"]
    while True: 
        try :
            llm = LLMChat(
                model_id=bedrock_model_ids[0],
            )
            print("PROCESS WITH MODEL ID: ", bedrock_model_ids[0])
            user_prompt, output_parser = llm.get_json_mode_prompt_parser(
                schemas=pydantic_model,
                additional_prompt=additional_prompt,
                prompt_type=prompt_type,
            )
            #Add assistant message for enable JSON Mode in Claude Model
            user_message_prompt = HumanMessagePromptTemplate(prompt=user_prompt)
            assistant_message_prompt = AIMessagePromptTemplate.from_template(template="{{")
            prompt = ChatPromptTemplate.from_messages([user_message_prompt, assistant_message_prompt])
            chain = prompt | llm | output_parser
            return await chain.ainvoke(content)
        
        except ClientError as e: 
            used_model_id = bedrock_model_ids.pop(0)
            bedrock_model_ids.append(used_model_id)
            error_code = e.response.get('Error', {}).get('Code', '')
            if error_code in ['ThrottlingException', 'TooManyRequestsException']: 
                print("[llm_doc_structure] [Throttling Error] Waiting a while before retrying...")
                if used_model_id == 'anthropic.claude-3-haiku-20240307-v1:0':
                    await asyncio.sleep(20)
                else: 
                    await asyncio.sleep(60)
            else: 
                print(f"[llm_doc_structure] [Error] {e}")
                raise e


def extract_json_with_schema_with_instructions(
        bedrock_model_id: str,
        format_instructions: str,
        content: str,
) -> dict:
    llm = LLMChat(
        model_id=bedrock_model_id,
    )
    prompt, output_parser = llm.get_json_mode_prompt_parser_with_instructions(
        format_instructions=format_instructions,
    )
    chain = prompt | llm | output_parser
    return chain.invoke(content)


def extract_json_columns_suggestion(
        bedrock_model_id: str,
        document_data: str,
        column_data: dict
):
    llm = LLMChat(
        model_id=bedrock_model_id,
    )

    prompt, output_parser = llm.get_prompt_parser_data_column_suggestion()
    chain = {
      "content": itemgetter("content") | RunnablePassthrough(),
      "column": itemgetter("column") | RunnablePassthrough(),
      "description": itemgetter("description") | RunnablePassthrough(),
      "column_value": itemgetter("column_value") | RunnablePassthrough()
    } | prompt | llm | output_parser

    return chain.invoke({"content": document_data, "column": column_data['old_column_name'],
                         "description": column_data['old_description'],
                         "column_value": column_data['old_column_value']})

