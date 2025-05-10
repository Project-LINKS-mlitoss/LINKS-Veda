import json
import os
from typing import Literal, Optional
import uuid
from collections import OrderedDict
from flask import jsonify, make_response
from pymongo import MongoClient
from datetime import datetime, timezone
from pydantic import BaseModel, ValidationError, field_validator
from google.cloud.run_v2 import JobsClient, RunJobRequest, EnvVar
from handle_create_rdf import handle_create_rdf, get_extension_file
from urllib.parse import quote_plus

MONGO_CLIENT = f"mongodb://{os.getenv('MONGO_CLIENT')}"
PASSWORD_MONGODB = os.getenv('PASSWORD_MONGODB')
USER_AUTH = os.getenv('USER_AUTH')
MONGO_DB = os.getenv('MONGO_DB')
MONGO_COLLECTION = os.getenv('MONGO_COLLECTION')
PROJECT_ID = os.getenv('PROJECT_ID')
REGION = os.getenv('REGION')
CREATE_RDF_JOB_NAME = os.getenv('CREATE_RDF_JOB_NAME')


class RequestBody(BaseModel):
    input: str
    inputType: Optional[Literal["geojson", "json"]] = None

    @field_validator('inputType', mode='before')
    def validate_input_type(cls, v):
        if v in ("", "null"):
            return None
        return v


def send_response(data, status=200):
    return make_response(jsonify(data), status)


def create_rdf(request):
    ticket_id = None
    output_file_path = None
    try:
        req = request.get_json()
        print('[CREATE RDF][INCOMING REQUEST]',req)
        
        validate_data = RequestBody(**req)
        req = dict(validate_data)

        input_file = req.get("input", "").strip()
        req["input"] = input_file

        ticket_id = create_ticket_id(req)
        req['ticketId'] = ticket_id

        # trigger_job(req)
        output_file_path, extension_file = get_extension_file(input_file)
        if output_file_path is None:
            raise Exception("ファイルをダウンロードできませんでした。")
        input_file = output_file_path
        if extension_file == "xlsx":
            data = handle_create_rdf(input_file)
            if data:
                update_information({"process": "Completed", "message": "処理が成功しました。"}, ticket_id)
                _response = OrderedDict({
                    "status": "ok",
                    'data': str(data),
                    'message': '処理が成功しました。',
                })
                print('[CREATE RDF][RESPONSE]',_response)
                return send_response(_response)
            else:
                update_information({"process": "Failed",'status': 'error', "message": "インプットファイルにデータが含まれていません。再度ご確認ください。"}, ticket_id)
                return send_response({'status': 'error', 'message': 'インプットファイルにデータが含まれていません。再度ご確認ください。'}, 500)
        else:
            update_information({"process": "Failed",'status': 'error', "message": "インプットファイルはXLSX形式である必要があります。"}, ticket_id)
            return send_response({'status': 'error', 'message': 'インプットファイルはXLSX形式である必要があります。'}, 400)
    
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
            "message": "入力データに問題が発生しました。データを確認するか、サポートにお問い合わせください。"
        }
        update_information(req, ticket_id)

        return send_response({'status': 'error', 'message': '処理失敗しました', 'ticketId': ticket_id}, 500)
    finally:
        if output_file_path is not None and os.path.exists(output_file_path):
            os.remove(output_file_path)


def trigger_job(data):
    print("[CREATE RDF] calling trigger job")
    try:
        # Create the job client
        jobs_client = JobsClient()

        # Get the job path
        job_path = jobs_client.job_path(PROJECT_ID, REGION, CREATE_RDF_JOB_NAME)

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
            "function": "create_rdf",
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
