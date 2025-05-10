from typing import Any, Dict, List, Literal, Optional
from google.cloud import run_v2
from pydantic import BaseModel, Field, ValidationError, field_validator
from pymongo import MongoClient
from flask import Response
from datetime import datetime, timezone
import json
import uuid
import os
from urllib.parse import quote_plus

MONGO_CLIENT = f"mongodb://{os.getenv('MONGO_CLIENT')}"
PASSWORD_MONGODB = os.getenv('PASSWORD_MONGODB')
USER_AUTH = os.getenv('USER_AUTH')
MONGO_DB = os.getenv('MONGO_DB')
MONGO_COLLECTION = os.getenv('MONGO_COLLECTION')
OCR_TOPIC = os.getenv('OCR_TOPIC')
PROJECT_ID = os.getenv('PROJECT_ID')
REGION = os.getenv('REGION')
STRUCTURE_JOB_NAME = os.getenv('STRUCTURE_JOB_NAME')


class GenSourceName(BaseModel):
    type: Literal["text", "column"]
    target: str


class File(BaseModel):
    id: str
    url: str


class RequestBody(BaseModel):
    mode: Literal["create", "update"]
    inputType: Optional[Literal["pdf", "docx", "xlsx", "csv"]] = None
    files: List[dict]
    schema_data: Dict[str, Any] = Field(..., alias='schema')
    prompt: str
    genSourceName: List[dict]
    apiEndpoint: str
    type_output: Literal["object", "array"] = "object"

    @field_validator('inputType', mode='before')
    def validate_input_type(cls, v):
        if v in ("", "null"):
            return None
        return v


def send_response(data, status=200):
    return Response(
        json.dumps(data, ensure_ascii=False, sort_keys=False),
        content_type='application/json; charset=utf-8',
        status=status
    )


def entry_unstruct_data(request):
    ticket_id = None
    try:
        data = request.get_json()
        print('[ENTRY UNSTRUCT DATA][INCOMING REQUEST]',data)
        
        validate_data = RequestBody(**data)
        data = dict(validate_data)

        data["apiEndpoint"] = data.get("apiEndpoint", "").strip()

        # create ticket ID
        ticket_id = create_ticket_id(data)

        # response
        properties = data["schema_data"]["properties"]
        updated_properties = {}
        for key, value in properties.items():
            properties_name = value.get("title", key)
            updated_properties[key] = {
                "name": properties_name,
                "type": value.get("type", "")
            }
        updated_properties.update({
            "_src_id": {"name": "出典ID", "type": "string"},
            "_src_name": {"name": "出典名", "type": "string"},
            "_src_url": {"name": "出典URL", "type": "string"}
        })
        updated_schema = {
            "type": "object",
            "properties": updated_properties
        }
        response = {
            "status": "ok",
            "ticketId": ticket_id,
            "message": "処理が成功しました。",
            "responseType": "json",
            "schema": updated_schema
        }
        data["ticketId"] = ticket_id
        # send event llm
        trigger_job(data)

        return send_response(response)
    except ConnectionError as e:
        print(f"[ENTRY UN-STRUCT DATA] ConnectionError: {repr(e)}")
        return send_response({'status': 'error', 'message': "チケットのステータス更新に失敗しました。しばらくしてから再試行するか、サポートにお問い合わせください。"}, 500)
    except ValidationError as e:
        print(f"[ENTRY UN-STRUCT DATA] ValidationError: {repr(e)}")
        return send_response({'status': 'error', 'message': "入力データに問題が発生しました。データを確認するか、サポートにお問い合わせください。"}, 400)
    except Exception as e:
        print(f"[ENTRY UN-STRUCT DATA] Error: {repr(e)}")
        req = {
            'status': 'error',
            "process": "Failed",
            'message': "処理に失敗しました。入力データを確認するか、サポートにお問い合わせください。"
        }
        update_information(req, ticket_id)
        return send_response({'status': 'error', 'message': '処理失敗しました', 'ticketId': ticket_id}, 500)


def create_ticket_id(data):
    global client
    try:
        escaped_user = quote_plus(USER_AUTH)
        escaped_password = quote_plus(PASSWORD_MONGODB)
        client = MongoClient(MONGO_CLIENT.replace("://", f"://{escaped_user}:{escaped_password}@"))
        db = client[MONGO_DB]
        collection = db[MONGO_COLLECTION]
        ticketId = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        formatted_time = now.strftime('%Y-%m-%d %H:%M:%S')
        document = {
            "_id": ticketId,
            "status": "ok",
            "function": "structure",
            "message": "",
            "created_at": formatted_time,
            "updated_at": formatted_time,
            "files": [
                {
                    "fileId": file.get('id'),
                    "url": file.get('url'),
                    "status": "ok",
                    "process": "Pending",
                    "message": ""
                }
                for file in data["files"]
            ]
        }
        collection.insert_one(document)
        return ticketId
    except BaseException as e:
        print("FAIL SS")
        print(f"error {e}")
        raise ConnectionError(e)
    finally:
        client.close()


def trigger_job(data):
    try:
        env = []
        data['schema'] = data['schema_data']
        data.pop('schema_data')
        data_str = json.dumps(data, ensure_ascii=False)
        count = 0
        for i in range(0, len(data_str), 16000):
            count += 1
            chunk = data_str[i:i + 16000]
            config = run_v2.EnvVar(name=f"DMS_DATA_{count}", value=chunk)

            env.append(config)

        count_env = run_v2.EnvVar(name="COUNT_CHUNK", value=str(count))

        env.append(count_env)
        client = run_v2.JobsClient()
        job_path = client.job_path(PROJECT_ID, REGION, STRUCTURE_JOB_NAME)
        request = run_v2.RunJobRequest(
            name=job_path,
            overrides=run_v2.RunJobRequest.Overrides(
                container_overrides=[
                    run_v2.RunJobRequest.Overrides.ContainerOverride(
                        env=env
                    )
                ]
            )
        )
        response = client.run_job(request=request)
        print(response)
    except BaseException as e:
        print(f"error {e}")
        raise Exception(e)


def update_information(data, ticketId):
    global client
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
        client.close()
