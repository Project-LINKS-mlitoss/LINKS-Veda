import os
import uuid
from datetime import datetime, timezone

from flask import jsonify, make_response
from pydantic import BaseModel, ValidationError, Field
from pymongo import MongoClient
from urllib.parse import quote_plus
from work_follow import graph

RAG_TEMPLATE = """Answer with respect to the context and must be in Japanese:
{context}

question: {question}

{format_instructions}
"""

MONGO_CLIENT = f"mongodb://{os.getenv('MONGO_CLIENT')}"
PASSWORD_MONGODB = os.getenv('PASSWORD_MONGODB')
USER_AUTH = os.getenv('USER_AUTH')
MONGO_DB = os.getenv('MONGO_DB')
MONGO_COLLECTION = os.getenv('MONGO_COLLECTION')


class RequestBody(BaseModel):
    prompt: str
    targetId: str | list[str]
    category: str


class LLMResponse(BaseModel):
    answer: str = Field(
        description="field contain llm answer\n1.Need to extract the most complete and accurate information possible based on the provided context.\n2.Answer must be in japanese")
    refer_document_urls: list[str] = Field(
        description="Here is the list of documents URLs(refer_document_url) of data that the LLM used to generate the answer. Please ensure to extract the exact URLs without adding any unnecessary information.")


def send_response(data, status=200):
    return make_response(jsonify(data), status)


def chatbot(request):
    try:
        request = request.get_json()
        print('[CHATBOT][INCOMING REQUEST]', request)
        
        RequestBody(**request)
        ticket_id = create_ticket_id()
        question = request.get('prompt', None)
        file_ids = request.get('targetId', [])
        if isinstance(file_ids, str):
            file_ids = [file_ids]
        if len(file_ids) == 0:
            raise ValidationError("ファイルIDが指定されていません。")
        result = graph.invoke({"question": question, "file_ids": file_ids})
        answer = result.get("generation")
        ref_docs = result.get("documents", [])
        if ref_docs:
            docs_markdown = {f"[{d.metadata.get("_src_name", "書類名")}]({d.metadata.get("_src_url", "")})" for d in ref_docs if d.metadata.get("_src_url")}
            document = "関連ドキュメント名:\n\n" + "\n\n".join(docs_markdown)
            answer += "\n\n" + document
        update_information({"process": "Completed", "message": "処理が完了しました"}, ticket_id)
        return send_response({
            "status": "ok",
            "answer": answer
        })
    except ValidationError as e:
        print(repr(e))
        return send_response({'status': 'error', 'message': str(e)}, 400)
    except ValueError as e:

        req = {
            'status': 'error',
            "process": "Failed",
            "message": str(e)
        }
        update_information(req, ticket_id)

        return send_response({'status': 'error', 'ticketId': ticket_id}, 400)
    except BaseException as e:
        print(e)
        req = {
            'status': 'error',
            "process": "Failed",
            "message": str(e)
        }
        update_information(req, ticket_id)

        return send_response({'status': 'error', 'ticketId': ticket_id}, 500)


def create_ticket_id():
    client = None
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
            "function": "chatbot",
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
        if client:
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

