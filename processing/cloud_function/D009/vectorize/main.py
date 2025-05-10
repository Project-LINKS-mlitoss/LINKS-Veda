import json
import mimetypes
import os
import re
import tempfile
import time
import uuid
from datetime import datetime, timezone
from typing import Literal, Optional

import magic
import pandas as pd
import requests
from flask import jsonify, make_response
from google.cloud.run_v2 import RunJobRequest, JobsClient, EnvVar
from pydantic import BaseModel, ValidationError, field_validator
from pymongo import MongoClient
from urllib.parse import quote_plus

MONGO_CLIENT = f"mongodb://{os.getenv('MONGO_CLIENT')}"
PASSWORD_MONGODB = os.getenv('PASSWORD_MONGODB')
USER_AUTH = os.getenv('USER_AUTH')
MONGO_DB = os.getenv('MONGO_DB')
MONGO_COLLECTION = os.getenv('MONGO_COLLECTION')

PROJECT_ID = os.getenv('PROJECT_ID')
REGION = os.getenv('REGION')
VECTORIZE_JOB_NAME = os.getenv('VECTORIZE_JOB_NAME')

# JWT Token For Download File
CMS_GET_ASSETS_TOKEN = os.getenv('CMS_GET_ASSETS_TOKEN', None)

class RequestBody(BaseModel):
    id: str
    input: str
    apiEndpoint: str
    inputType: Optional[Literal["geojson", "json"]] = None
    
    @field_validator('inputType', mode='before')
    def validate_input_type(cls, v):
        if v in ("", "null"):
            return None
        return v


def send_response(data, status=200):
    return make_response(jsonify(data), status)


def vectorize(request):
    ticket_id = None
    try:
        request_data = request.get_json()
        print('[VECTORIZE][INCOMING REQUEST]', request_data)
        
        validate_data = RequestBody(**request_data)
        request_data = dict(validate_data)

        request_data["apiEndpoint"] = request_data.get("apiEndpoint", "").strip()
        request_data["input"] = request_data.get("input", "").strip()

        ticket_id = create_ticket_id(request_data)
        request_data['ticketId'] = ticket_id
        trigger_job(request_data)

        response = {
            'status': 'ok',
            'ticketId': ticket_id,
            'message': '処理が成功しました。',
        }
        return send_response(response)
    except ValidationError as e:
        print(repr(e))
        return send_response({'status': 'error', 'message': "入力データに問題が発生しました。データを確認するか、サポートにお問い合わせください。"}, 400)
    except ValueError as e:
        
        req = {
            'status': 'error',
            "process": "Failed",
            "message": str(e)
        }
        update_information(req, ticket_id)

        return send_response({'status': 'error', 'message': str(e), 'ticketId': ticket_id}, 400)

    except BaseException as e:
        print(e)

        req = {
            'status': 'error',
            "process": "Failed",
            "message": str(e)
        }
        update_information(req, ticket_id)

        return send_response({'status': 'error', 'message': '処理失敗しました', 'ticketId': ticket_id}, 500)


def trigger_job(data):
    print("[TEXT MATCH] calling trigger job")
    try:
        # Create the job client
        jobs_client = JobsClient()

        # Get the job path
        job_path = jobs_client.job_path(PROJECT_ID, REGION, VECTORIZE_JOB_NAME)

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
            "function": "vectorize",
            "message": "",
            "created_at": formatted_time,
            "updated_at": formatted_time
        }
        collection.insert_one(document)
        return ticketId
    except BaseException as e:
        print(f"error {e}")
        raise Exception(e)
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


def get_extension_file(url):
    try:
        ext_file = get_extention_file_from_url(url)
        if ext_file["status"]:
            return ext_file["ext"]
        else:
            # Download file
            arr_file_url = url.split('/')
            file_name = arr_file_url[len(arr_file_url) - 1]

            start_time = time.time()
            data = requests.get(url, stream=True)
            with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                for chunk in data.iter_content(chunk_size=8192):
                    if chunk:
                        temp_file.write(chunk)

                output_file = temp_file.name

            validator = magic.Magic(uncompress=True, mime=True)
            file_type = validator.from_file(output_file)
            extension = mimetypes.guess_extension(file_type, strict=True).replace('.', '')

            if extension and extension != 'txt' or extension == None:
                return extension
            else:
                file = open(output_file, "r", encoding="utf8", errors="ignore")
                data = file.read()
                is_json = is_json_file(data)
                file.close()
                if is_json["status"]:
                    os.remove(output_file)
                    return is_json["ext"]

                is_csv = is_csv_file(output_file)
                if is_csv["status"]:
                    os.remove(output_file)
                    return is_csv["ext"]


                return 'txt'
    except BaseException as e:
        print(e)
        return 'txt'


def is_json_file(file_data):
    json_data = None
    try:
        json_data = json.loads(file_data)
        # Check geojson or json
        if type(json_data) == dict:
            if (
                    "type" in json_data
                    and json_data["type"] == "FeatureCollection"
                    and "features" in json_data
                    and type(json_data["features"]) == list
            ):
                return {"status": True, "ext": "geojson"}
            else:
                return {"status": True, "ext": "json"}
        else:
            return {"status": True, "ext": "json"}
    except BaseException as e:
        return {"status": False, "ext": ""}


def is_csv_file(data):
    try:
        pd.read_csv(data)
        return {"status": True, "ext": "csv"}
    except Exception as e:
        return {"status": False, "ext": "not csv"}


def get_extention_file_from_url(url):
    arr_file_url = url.split('/')
    file_name = arr_file_url[len(arr_file_url) - 1]
    arr_file_name = file_name.split('.')
    if len(arr_file_name) > 1:
        return {'status': True, 'ext': arr_file_name[len(arr_file_name) - 1]}
    else:
        return {'status': False, 'ext': ''}