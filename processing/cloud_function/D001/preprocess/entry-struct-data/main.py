import mimetypes
import tempfile
import time
from typing import List, Literal, Optional, Any

import magic
import pandas as pd
import requests
from flask import jsonify, make_response
from datetime import datetime, timezone
from google.cloud.run_v2 import JobsClient, RunJobRequest, EnvVar
from pydantic import BaseModel, ValidationError, field_validator
from pymongo import MongoClient
import json
import uuid
import os
from urllib.parse import quote_plus

MONGO_CLIENT = f"mongodb://{os.getenv('MONGO_CLIENT')}"
PASSWORD_MONGODB = os.getenv('PASSWORD_MONGODB')
USER_AUTH = os.getenv('USER_AUTH')
MONGO_DB = os.getenv('MONGO_DB')
MONGO_COLLECTION = os.getenv('MONGO_COLLECTION')
PROJECT_ID = os.getenv('PROJECT_ID')
REGION = os.getenv('REGION')
DATA_CLEANING_JOB_NAME = os.getenv('DATA_CLEANSING_JOB_NAME')
CMS_GET_ASSETS_TOKEN = os.getenv("CMS_GET_ASSETS_TOKEN", "")

class RequestBody(BaseModel):
    input: str
    inputType: Literal["json", "shapefile", "geojson", "csv"] = None
    cleansing: Optional[List[Any]] = None
    normalizeCrs: Optional[bool] = False
    geocoding: Optional[dict] = None
    documentName: str
    apiEndpoint: str

    @field_validator('geocoding', 'cleansing', mode='before')
    def handle_empty_data(cls, v):
        if isinstance(v, list) and len(v) == 0:
            return None
        elif isinstance(v, dict) and not v:
            return None
        return v


def send_response(data, status=200):
    return make_response(jsonify(data), status)


def entry_struct_data(request):
    ticket_id = None
    try:
        data = request.get_json()
        print('[ENTRY STRUCT DATA][INCOMING REQUEST]', data)
        
        validate_data = RequestBody(**data)
        data = dict(validate_data)
        data["apiEndpoint"] = data.get("apiEndpoint", "").strip()
        data["input"] = data.get("input", "").strip()

        # create ticket ID
        ticket_id = create_ticket_id(data)

        response_type = 'json'
        extension = get_extension_file(data['input'])
        data['inputType'] = extension if extension != 'zip' else 'shapefile'
        if data["inputType"] == 'geojson' or data["inputType"] == 'shapefile' or data["geocoding"] is not None:
            response_type = 'geojson'
        data['ticketId'] = ticket_id

        trigger_job(data)

        response = {
            "status": "ok",
            "ticketId": ticket_id,
            "message": "Preprocess",
            "responseType": response_type
        }
        return send_response(response)
    except ConnectionError as e: 
        print(repr(e))
        return send_response({'status': 'error', 'message': "チケットのステータス更新に失敗しました。しばらくしてから再試行するか、サポートにお問い合わせください。"}, 500)
    except ValidationError as e:
        print(repr(e))
        return send_response({'status': 'error', 'message': "入力データに問題が発生しました。データを確認するか、サポートにお問い合わせください。"}, 400)
    except Exception as e:
        print(e)
        req = {
            'status': 'error',
            "process": "Failed",
            'message': "処理に失敗しました。入力データを確認するか、サポートにお問い合わせください。"
        }
        update_information(req, ticket_id)

        return send_response({'status': 'error', 'message': '処理失敗しました', 'ticketId': ticket_id}, 500)


def trigger_job(data):
    print("[DATA CLEANING] calling trigger job")
    try:
        # Create the job client
        jobs_client = JobsClient()

        # Get the job path
        job_path = jobs_client.job_path(PROJECT_ID, REGION, DATA_CLEANING_JOB_NAME)

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
            "function": "preprocess",
            "process": "Pending",
            "message": "",
            "created_at": formatted_time,
            "updated_at": formatted_time,
            "file": data["input"]
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


# Function get extension file
def get_extension_file(url):
    try:
        headers = None
        if CMS_GET_ASSETS_TOKEN:
            headers = {'Authorization': f"Bearer {CMS_GET_ASSETS_TOKEN}"}
        data = requests.get(url, stream=True, headers=headers)
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            for chunk in data.iter_content(chunk_size=8192):
                if chunk:
                    temp_file.write(chunk)

            output_file = temp_file.name
        ext_file = get_extention_file_from_url(url)
        if ext_file["status"]:
            return ext_file["ext"]
        else:
            # Download file
            validator = magic.Magic(uncompress=True, mime=True)
            file_type = validator.from_file(output_file)
            extension = mimetypes.guess_extension(file_type, strict=True).replace('.', '')

            if extension and extension != 'txt' or extension == None:
                return extension
            else:
                is_csv = is_csv_file(output_file)
                if is_csv["status"]:
                    return is_csv["ext"], output_file

                file = open(output_file, "r", encoding="utf8", errors="ignore")
                data = file.read()
                is_json = is_json_file(data)
                if is_json["status"]:
                    file.close()
                    os.remove(output_file)
                    return is_json["ext"]

                file.close()
                os.remove(output_file)
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
