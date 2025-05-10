import os
import time
import boto3
from langchain_community.document_loaders import AzureAIDocumentIntelligenceLoader
from langchain_aws import ChatBedrock
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import PromptTemplate
from json import JSONDecoder
from collections import OrderedDict
from flask import jsonify, make_response
import tempfile
import requests
from pydantic import BaseModel

custom_json_decoder = JSONDecoder(object_pairs_hook=OrderedDict)
DOCUMENT_INTELLIGENCE_ENDPOINT = os.getenv('DOCUMENT_INTELLIGENCE_ENDPOINT')
DOCUMENT_INTELLIGENCE_KEY = os.getenv('DOCUMENT_INTELLIGENCE_KEY')
CMS_GET_ASSETS_TOKEN = os.getenv('CMS_GET_ASSETS_TOKEN')
aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
prompt_message= """
You are an expert in data analysis and processing. Based on the provided context, you will create a suitable JSON Schema to store key-value information extracted from the context.

### Context:
{context}

### Requirements:
1. Generate a complete JSON Schema that includes:
   - `properties` corresponding to the keys in the context, properties name must be Japanese
   - Accurate data types (string, number) based on the values.
   - Add a short `description` for each `property` explaining its meaning.
2. In the document, it's possible that the keys are placed under the same header and separated by the symbol "、"
3. The output of the schema will not have nested properties.
4. Ensure the JSON Schema conforms to the [JSON Schema Draft 2020-12](https://json-schema.org/).

### Output format:
```json
{{
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "object",
    "properties": {{
        "key1": {{
            "type": "string",
            "description": "Short description of key1."
        }},
        "key2": {{
            "type": "number",
            "description": "Short description of key2."
        }}
        ...
    }}
}}
"""

def send_response(data, status=200):
    return make_response(jsonify(data), status)

class RequestBody(BaseModel):
    input: str
def suggest_schema_structure(request):
    try:
        req = request.get_json()
        print('[SUGGEST SCHEMA STRUCTURE][INCOMING REQUEST]',req)

        validate_data = RequestBody(**req)
        req = dict(validate_data)

        input_file = req.get("input", '').strip()
        print("URL: ", input_file)

        # Download file
        headers = None
        if CMS_GET_ASSETS_TOKEN:
            headers = {'Authorization': f"Bearer {CMS_GET_ASSETS_TOKEN}"}
        data = requests.get(input_file, stream=True, headers=headers)
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            for chunk in data.iter_content(chunk_size=8192):
                if chunk:
                    temp_file.write(chunk)

            output_file = temp_file.name

        data = ocr_file(output_file)
        schema = get_schema(data[0].page_content)
        schema["properties"] = flatten_json(schema.get("properties"))
        response = {
            "status": "ok",
            "data": schema,
            "message": "Success"
        }
        return send_response(response)
    except BaseException as e:
        print(e)
        response = {
            "status": "error",
            "message": "入力データに問題が発生しました。データを確認するか、サポートにお問い合わせください。"
        }
        return send_response(response)

def ocr_file(file_path:str):
    document_loader = AzureAIDocumentIntelligenceLoader(
        api_endpoint=DOCUMENT_INTELLIGENCE_ENDPOINT,
        api_key=DOCUMENT_INTELLIGENCE_KEY,
        file_path=file_path,
        api_model="prebuilt-layout"
    )
    return document_loader.load()


def get_schema(context: str):
    client = boto3.client(
            "bedrock-runtime",
            region_name="ap-northeast-1",
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key,
        )
    llm = ChatBedrock(
        model_id="anthropic.claude-3-5-sonnet-20240620-v1:0",
        client=client,
        model_kwargs={"temperature": 0},
    )
    data = None
    count_retries = 1
    runner_retries = True
    while runner_retries:
        try:
            prompt_template = PromptTemplate(template = prompt_message, input_variables=["context"])
            parser = JsonOutputParser()
            chain = prompt_template | llm | parser
            data = chain.invoke({"context": context})
            print('[GET SCHEMA] data: ', data)
            runner_retries = False
        except Exception as e:
            print(f"[GET SCHEMA] try {count_retries}th Error: ", e)
            count_retries += 1
            if count_retries <= 10:
                time.sleep(60)
                continue

    return data

def flatten_json(data, parent_key=''):
    flat_dict = {}
    
    for key, value in data.items():
        new_key = f"{parent_key}_{key}" if parent_key else key
        
        if isinstance(value, dict):
            if 'properties' not in value and 'items' not in value:
                flat_dict[new_key] = value
            elif 'properties' in value:
                flat_dict.update(flatten_json(value['properties'], new_key))
            elif 'type' in value and value['type'] == 'array' and 'items' in value:
                flat_dict[new_key] = {"description": value["description"], "type": "string"}
            else:
                flat_dict.update(flatten_json(value, new_key))
        else:
            flat_dict[new_key] = value
    
    return flat_dict
