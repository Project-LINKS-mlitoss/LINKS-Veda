import asyncio
import json
import os
import sys
import time
from collections import OrderedDict
from datetime import datetime, timezone
from typing import Type

import httpx
from botocore.exceptions import ClientError
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, create_model
from pymongo import MongoClient

from ai_ocr.utils import get_config, aload_documents
from lib.llm_utils import aextract_from_doc_ocr
from lib.ocr_types import RequestBody
from lib.ocr_utils import confirm_request, get_extension_file
import signal
from urllib.parse import quote_plus

semaphore = asyncio.Semaphore(20)
# Retrieve Job-defined env vars
TASK_INDEX = os.getenv("CLOUD_RUN_TASK_INDEX", 0)
TASK_ATTEMPT = os.getenv("CLOUD_RUN_TASK_ATTEMPT", 0)
# Retrieve User-defined env vars
MONGO_CLIENT = f"mongodb://{os.getenv('MONGO_CLIENT')}"
PASSWORD_MONGODB = os.getenv('PASSWORD_MONGODB')
USER_AUTH = os.getenv('USER_AUTH')
MONGO_DB = os.getenv('MONGO_DB')
MONGO_COLLECTION = os.getenv('MONGO_COLLECTION')
CMS_GET_ASSETS_TOKEN = os.getenv("CMS_GET_ASSETS_TOKEN", "")
DMS_DATA = os.getenv("DMS_DATA", "")
TICKET_ID=None
type_mapping = {
    "text": str,
    "string": str,
    "float": float,
    "integer": int,
    "boolean": bool,
    "number": float,
    "int": int,
}

def handle_timeout(signum, frame):
    global TICKET_ID
    print("Job timed out! Exiting gracefully...")
    req = {
        "status": "error",
        "message": "ジョブのタイムアウトです。ファイルの数を小分けにしてください。"
    }
    update_information_total(req, TICKET_ID)
    # Perform cleanup or logging here
    sys.exit(1)

async def update_information(data, ticketId):
    client = None
    try:
        escaped_user = quote_plus(USER_AUTH)
        escaped_password = quote_plus(PASSWORD_MONGODB)
        client = AsyncIOMotorClient(MONGO_CLIENT.replace("://", f"://{escaped_user}:{escaped_password}@"))
        db = client[MONGO_DB]
        collection = db[MONGO_COLLECTION]
        now = datetime.now(timezone.utc)
        formatted_time = now.strftime('%Y-%m-%d %H:%M:%S')
        document = {
            "updated_at": formatted_time
        }
        merged_dict = data.copy()
        merged_dict.update(document)
        result = await collection.update_one({"_id": ticketId, "files.fileId": merged_dict['fileId']},
                                             {"$set": {"files.$": merged_dict}})
        print(f"Result update file: {merged_dict['fileId']}", result)
    except BaseException as e:
        print(f"error {e}")
    finally:
        if client:
            client.close()

def update_information_total(data, ticketId):
    client = None
    try:
        escaped_user = quote_plus(USER_AUTH)
        escaped_password = quote_plus(PASSWORD_MONGODB)
        client = MongoClient(MONGO_CLIENT.replace("://", f"://{escaped_user}:{escaped_password}@"))
        db = client[MONGO_DB]
        collection = db[MONGO_COLLECTION]
        now = datetime.now(timezone.utc)
        formatted_time = now.strftime('%Y-%m-%d %H:%M:%S')
        document = {
            "updated_at": formatted_time
        }
        merged_dict = data.copy()
        merged_dict.update(document)
        collection.update_one({"_id": ticketId}, {"$set": merged_dict})
    except BaseException as e:
        print(f"error {e}")
    finally:
        if client:
            client.close()


async def doc_ocr(data, extension):
    file_id = data["file"]["id"]
    file_url = data["file"]["url"]
    file_path = data["file"]["file_path"]
    body = RequestBody(file_path=file_path)
    try:
        is_valid_extension = confirm_request(extension)
        if not is_valid_extension:
            req = {
                "fileId": file_id,
                "file_url": file_url,
                'status': 'error',
                'process': 'Failed',
                'message': 'ファイルの拡張子が対応していません。PDF、DOCX、XLSXをご用意ください。'
            }
            await update_information(req, data['ticketId'])
            raise BaseException('ファイルの拡張子が対応していません。PDF、DOCX、XLSXをご用意ください。')

        config = await get_config(body, extension)
        documents = []
        count = 1
        while True:
            try:
                documents = [
                    {
                        "page_content": d.page_content,
                        "metadata": d.metadata,
                    }
                    for d in await aload_documents(config)

                ]
                break
            except Exception as e:
                print(f"Have exception occured when performing OCR at times {count}th")
                print(e)
                count += 1
                if count > 5:
                    break
                await asyncio.sleep(60)
        if not documents:
            await update_information({
                "fileId": file_id,
                "file_url": file_url,
                "status": "error",
                "message": f'ファイル {file_url} のOCRを実行できませんでした。ファイルのダウンロードに失敗したか、OCRの処理が制限に達した可能性があります。しばらく待ってから再試行するか、ファイルのURLが正しいことを確認してください。',
                "process": "Failed"
            }, data["ticketId"])
            return None

        content = "\n".join([doc["page_content"] for doc in documents])
        data["content"] = content
        return data
    except BaseException as e:
        print(f"error {repr(e)}")
        await update_information({
            "fileId": file_id,
            "file_url": file_url,
            "status": "error",
            "message": str(e),
            "process": "Failed"
        }, data["ticketId"])
        return None


def generate_src_name(gen_source_name, data):
    src_name = ""
    try:
        for source in gen_source_name:
            if source["type"] == "text":
                src_name += str(source["target"])
            else:
                src_name += str(data[source["target"]])
    except BaseException as e:
        print(f"Error function generate_src_name: {e}")

    return src_name


async def call_api_endpoint(data, ticketId, fileId, apiEndpoint, confidence, suggestion):
    try:
        request = OrderedDict({
            "ticketId": ticketId,
            "fileId": fileId,
            "data": data,
            "confidence": confidence,
            "suggestion": suggestion
        })
        print("Process done, call api endpoint")
        async with httpx.AsyncClient() as client:
            response = await client.post(apiEndpoint.strip(), json=request)
        print("response", response)
    except httpx.HTTPStatusError as http_err:
        print(f"HTTP error occurred: {http_err}")
    except BaseException as err:
        print(f"Other error occurred: {err}")


async def llm_doc_structure(data, file_extension):
    try:

        file_url = data["file"]["url"]
        bedrock_model_ids = ["anthropic.claude-3-5-sonnet-20240620-v1:0", "anthropic.claude-3-haiku-20240307-v1:0"]

        await update_information({
            "fileId": data["file"]["id"],
            "file_url": file_url,
            "process": "Processing"
        }, data["ticketId"])
        PydanticModelOutput, confidence = create_llm_output_pydantic_model(data["schema"]["properties"],
                                                                           data.get("type_output", "object"))
        keys = list(data["schema"]["properties"].keys())
        request_ocr = {
            "json_schema": data["schema"],
            "content": data["content"],
            "format_instructions": "",
            "file_url": file_url,
            "additional_prompt": data["prompt"],
            "schema_mode": "strict",
            "bedrock_model_id": None,
            "ensemble": True,
            "pydantic_model": PydanticModelOutput,
            "type_output": data["type_output"],
            "keys": keys
        }

        response = None
        countRs = 1
        while True:
            print(f"Structure file {file_url}")
            try:
                request_ocr["bedrock_model_id"] = bedrock_model_ids[0]
                response = await aextract_from_doc_ocr(request_ocr)
                print("response llm", response)
                break
            except ClientError as e:
                error_code = e.response.get('Error', {}).get('Code', '')
                if error_code == 'ValidationException':
                    raise BaseException(f"入力データがモデルの制限を超えています。入力内容を確認してください。不要なページを削除し、必要なページのみを残すことで、入力データを減らすことを検討してください。")
            except Exception as e:
                print(f"Error occured when structure file {file_url}")
                raise e

        if response:
            llm_result = response.get("obj", None)
            gen_source_name = data.get("genSourceName", None)
            if data["type_output"] == 'object':
                properties = llm_result
                if properties:
                    filtered_data = {key: properties.get(key, None) for key in keys}
                    filtered_data["_src_id"] = data["file"]["id"]
                    filtered_data["_src_url"] = file_url
                    if gen_source_name:
                        filtered_data["_src_name"] = generate_src_name(gen_source_name, filtered_data)
                    else:
                        filtered_data["_src_name"] = ''
                    properties = filtered_data
                else:
                    raise BaseException(f"LLMの応答エラー: {json.dumps(response)}。応答にプロパティが含まれていません。別のドキュメントを試すか、サポートにお問い合わせください。")

                data_suggestion = {}
                await call_api_endpoint(properties, data["ticketId"], data["file"]["id"], data["apiEndpoint"],
                                        confidence,
                                        data_suggestion)
            else:
                for record in llm_result:
                    for key in keys:
                        if isinstance(record.get(key), (dict, list)):
                            record[key] = None
                            continue
                        record.setdefault(key, None)
                    record["_src_id"] = data["file"]["id"]
                    record["_src_url"] = file_url
                    if gen_source_name:
                        record["_src_name"] = generate_src_name(gen_source_name, record)
                    else:
                        record["_src_name"] = ''
                await call_api_endpoint(llm_result, data["ticketId"], data["file"]["id"], data["apiEndpoint"],
                                        confidence,
                                        {})
            await update_information({
                "fileId": data["file"]["id"],
                "file_url": file_url,
                "message": "処理が成功しました。",
                "process": "Completed",
            }, data["ticketId"])

        else:
            raise BaseException(f"LLMから結果が返されませんでした。ファイルの内容が明確で読み取り可能か、破損していないかを確認してください。別のドキュメントを試すか、サポートにお問い合わせください。")

    except BaseException as err:
        print(f"Error: {repr(err)}")
        await update_information({
            "fileId": data["file"]["id"],
            "file_url": data["file"]["url"],
            "status": "error",
            "message": str(err),
            "process": "Failed"
        }, data["ticketId"])


from process_excel import chunk_excel_file, structure_excel_data


async def ocr_excel(data):
    file_path = data["file"]["file_path"]
    keys = list(data["schema"]["properties"].keys())
    data['excel_data'] = await chunk_excel_file(file_path, len(keys))
    return data


async def structure_excel(data):
    try:

        excel_data = data.get("excel_data", [])
        if not excel_data:
            return
        keys = list(data["schema"]["properties"].keys())
        await update_information({
            "fileId": data["file"]["id"],
            "file_url": data["file"]["url"],
            "process": "Processing"
        }, data["ticketId"])

        PydanticModelOutput, confidence = create_llm_output_pydantic_model(data["schema"]["properties"],
                                                                           data.get("type_output", "object"))
        llm_result = await structure_excel_data(excel_data, PydanticModelOutput, data['prompt'], data["file"]["url"])
        gen_source_name = data.get("genSourceName", None)
        if llm_result:
            for record in llm_result:
                for key in keys:
                    if isinstance(record.get(key), (dict, list)):
                        record[key] = None
                        continue
                    record.setdefault(key, None)
                record["_src_id"] = data["file"]["id"]
                record["_src_url"] = data["file"]["url"]
                if gen_source_name:
                    record["_src_name"] = generate_src_name(gen_source_name, record)
                else:
                    record["_src_name"] = ''
            await call_api_endpoint(llm_result, data["ticketId"], data["file"]["id"], data["apiEndpoint"], confidence, {})
            await update_information({
                "fileId": data["file"]["id"],
                "file_url": data["file"]["url"],
                "message": "処理が成功しました。",
                "process": "Completed",
            }, data["ticketId"])
        else:
            raise BaseException(f"LLMから結果が返されませんでした。Excelのデータ形式が無効、またはデータが含まれていない可能性があります。Excelのデータ形式を確認し、正しく入力されていることを確認してください。")
    except BaseException as err:
        print(f"Error: {repr(err)}")
        await update_information({
            "fileId": data["file"]["id"],
            "file_url": data["file"]["url"],
            "status": "error",
            "message": str(err),
            "process": "Failed"
        }, data["ticketId"])



async def process_structure_data(data):
    async with semaphore:
        print("*" * 20)
        print(f"Start ocr process {data['file']['id']} {data['file']['url']}")
        print(data)
        file_url = data["file"]["url"]

        extension, file_path = await get_extension_file(file_url)
        if file_path is not None:
            data["file"]["file_path"] = file_path
        else:
            await update_information({
                "fileId": data["file"]["id"],
                "file_url": data["file"]["url"],
                "status": "error",
                "message": "ファイルを処理するためにダウンロードできませんでした。",
                "process": "Failed"
            }, data["ticketId"])
            return
        if extension not in ['xlsx', 'xls'] or data["type_output"] == 'object':
            ocr_data = await doc_ocr(data, extension)
            print("*" * 20)
            print(f"Finish ocr process {data['file']['id']} {data['file']['url']}")
            if ocr_data:
                print("*" * 20)
                print(f"Start llm structure process {data['file']['id']} {data['file']['url']}")
                await llm_doc_structure(ocr_data, extension)
                print("*" * 20)
                print(f"Finish llm structure process {data['file']['id']} {data['file']['url']}")
        else:
            excel_data = await ocr_excel(data)
            await structure_excel(excel_data)
        try:
            if file_path and os.path.exists(file_path):
                await asyncio.to_thread(os.remove, file_path)
        except Exception as err:
            print(f"deleted downloaded file")



# Define main script
async def main():
    print(f"Starting Task #{TASK_INDEX}, Attempt #{TASK_ATTEMPT}...")
    count_chunk = int(os.getenv("COUNT_CHUNK", 1))
    env_data = ""
    if count_chunk >= 1:
        for i in range(1, int(count_chunk) + 1):
            env_data += os.getenv(f"DMS_DATA_{i}", "")
    json_data = env_data
    if json_data:
        data = json.loads(json_data)
        global TICKET_ID
        TICKET_ID = data["ticketId"]
        print("[DMS_DATA]", data)
        temp_dict = {k: v for k, v in data.items() if k != 'files'}
        list_files = data["files"]
        list_data = []
        for file in list_files:
            child_dict = temp_dict.copy()
            file["url"] = file.get("url", "").strip()
            child_dict['file'] = file
            child_dict.setdefault("type_output", "object")
            list_data.append(child_dict)
        for i in range(0, len(list_data), 5):
            chunk = list_data[i:i + 5]
            await asyncio.gather(*[process_structure_data(data) for data in chunk])
            await asyncio.sleep(30)
    else:
        print("No data provided")

    print(f"Completed Task #{TASK_INDEX}.")


def create_llm_output_pydantic_model(properties: dict, type_output: str) -> (Type[BaseModel], dict):
    fields = {}
    confidence = {}
    for field_name, field_info in properties.items():
        confidence[field_name] = 1
        field_type = type_mapping.get(field_info["type"], str)
        description = field_info.get("description", "")
        fields[field_name] = (field_type, Field(default=None, description=description))

    JsonOutputObjectModel = create_model("JsonOutputObjectModel", **fields)
    if type_output != "array":
        return JsonOutputObjectModel, confidence
    JsonOutputArrayModel = create_model("JsonOutputArrayModel", llm_response_array=(
        list[JsonOutputObjectModel], Field(default=[])))
    return JsonOutputArrayModel, confidence


# Start script
if __name__ == "__main__":
    signal.signal(signal.SIGALRM, handle_timeout)
    signal.alarm(84600)
    try:
        start_time = time.time()
         # 5 minutes
        asyncio.run(main())
        end_time = time.time()
        elapsed_time = end_time - start_time
        print(f"Time excution : {elapsed_time:.6f} seconds.")

    except Exception as err:
        print(err)
        message = (
                f"Task #{TASK_INDEX}, " + f"Attempt #{TASK_ATTEMPT} failed: {str(err)}"
        )
        print(json.dumps({"message": message, "severity": "ERROR"}))
        sys.exit(1)  # Retry Job Task by exiting the process
    finally:
        signal.alarm(0)
