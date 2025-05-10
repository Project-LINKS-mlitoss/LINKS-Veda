import json
import os
from typing import Literal, Optional
import uuid
from flask import jsonify, make_response
from pymongo import MongoClient
from datetime import datetime, timezone
from pydantic import BaseModel, ValidationError, field_validator
from google.cloud.run_v2 import JobsClient, RunJobRequest, EnvVar
from urllib.parse import urlparse
from urllib.parse import quote_plus

MONGO_CLIENT = f"mongodb://{os.getenv('MONGO_CLIENT')}"
PASSWORD_MONGODB = os.getenv('PASSWORD_MONGODB')
USER_AUTH = os.getenv('USER_AUTH')
MONGO_DB = os.getenv('MONGO_DB')
MONGO_COLLECTION = os.getenv('MONGO_COLLECTION')

PROJECT_ID = os.getenv('PROJECT_ID')
REGION = os.getenv('REGION')
TEXT_MATCH_JOB_NAME = os.getenv('TEXT_MATCH_JOB_NAME')


class RequestBody(BaseModel):
    inputLeft: str
    inputRight: str
    where: list
    threshold: float
    keepRightFields: Optional[list] = None
    apiEndpoint: str
    inputType: Optional[Literal["geojson", "json"]] = None

    @field_validator('inputType', mode='before')
    def validate_input_type(cls, v):
        if v in ("", "null"):
            return None
        return v


def send_response(data, status=200):
    return make_response(jsonify(data), status)


def text_match(request):
    try:
        req = request.get_json()
        print('[TEXT MATCH][INCOMING REQUEST]', req)
        
        validate_data = RequestBody(**req)
        req = dict(validate_data)

        req["apiEndpoint"] = req.get("apiEndpoint", "").strip()
        req["inputLeft"] = req.get("inputLeft", "").strip()
        req["inputRight"] = req.get("inputRight", "").strip()

        ticket_id = create_ticket_id(req)

        input_left = req['inputLeft']
        # Parse the URL
        parsed_url = urlparse(input_left)
        # Get the filename from the path
        file_name = os.path.basename(parsed_url.path)
        # Get the file extension
        file_parts = file_name.split('.')
        file_extension = file_parts[-1] if len(file_parts) > 1 else 'json'

        req['ticketId'] = ticket_id
        trigger_job(req)

        return send_response(
            {'status': 'ok', 'ticketId': ticket_id, "responseType": file_extension, 'message': '処理が成功しました。'})
    except ConnectionError as e:
        print(repr(e))
        return send_response({'status': 'error', 'message': "チケットのステータス更新に失敗しました。しばらくしてから再試行するか、サポートにお問い合わせください。"}, 500)
    except ValidationError as e:
        print(repr(e))
        return send_response({'status': 'error', 'message': "入力データに問題が発生しました。データを確認するか、サポートにお問い合わせください。"}, 400)
    except BaseException as e:
        print(f"Error: {e}")
        req = {
            'status': 'error',
            "process": "Failed",
            "message": "処理に失敗しました。入力データを確認するか、サポートにお問い合わせください。"
        }
        update_information(req, ticket_id)

        return send_response({'status': 'error', 'message': '処理失敗しました', 'ticketId': ticket_id}, 500)


def trigger_job(data):
    print("[TEXT MATCH] calling trigger job")
    try:
        # Create the job client
        jobs_client = JobsClient()

        # Get the job path
        job_path = jobs_client.job_path(PROJECT_ID, REGION, TEXT_MATCH_JOB_NAME)

        # Create the run job request
        job_request = RunJobRequest(
            name=job_path,
            overrides=RunJobRequest.Overrides(
                container_overrides=[
                    RunJobRequest.Overrides.ContainerOverride(
                        env=[
                            EnvVar(name="DMS_DATA", value=json.dumps(data, ensure_ascii=False)),
                        ]
                    )
                ]

            )
        )
        # Trigger the job
        job_response = jobs_client.run_job(request=job_request)
        print(job_response)
    except Exception as e:
        print(f"error {e}")
        raise


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
            "process": "Processing",
            "function": "text_match",
            "message": "",
            "created_at": formatted_time,
            "updated_at": formatted_time
        }
        collection.insert_one(document)
        return ticketId
    except BaseException as e:
        print(f"error {e}")
        raise ConnectionError(e)
    finally:
        client.close()


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
