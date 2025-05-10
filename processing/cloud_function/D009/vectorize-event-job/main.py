import asyncio
import json
import math
import mimetypes
import os
import sys
import tempfile
import time
from collections import OrderedDict
from datetime import datetime
from datetime import timezone

import boto3
import geopandas as gpd
import magic
import pandas as pd
import requests
from langchain_aws.embeddings import BedrockEmbeddings
from langchain_community.document_loaders import DataFrameLoader
from langchain_google_community import BigQueryVectorStore
from pymongo import MongoClient
from urllib.parse import quote_plus
from llm import LLMChat

MONGO_CLIENT = f"mongodb://{os.getenv('MONGO_CLIENT')}"
PASSWORD_MONGODB = os.getenv('PASSWORD_MONGODB')
USER_AUTH = os.getenv('USER_AUTH')
MONGO_DB = os.getenv('MONGO_DB')
MONGO_COLLECTION = os.getenv('MONGO_COLLECTION')
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID', '')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY', '')
REGION = os.getenv('REGION', 'asia-northeast1')
PROJECT_ID = os.getenv('PROJECT_ID', 'projectlinks')
DATASET_NAME = os.getenv('DATASET_NAME', '')
# Retrieve Job-defined env vars
TASK_INDEX = os.getenv("CLOUD_RUN_TASK_INDEX", 0)
TASK_ATTEMPT = os.getenv("CLOUD_RUN_TASK_ATTEMPT", 0)
# Retrieve User-defined env vars
DMS_DATA = os.getenv("DMS_DATA", "")
TABLE_NAME = "dms_vector_store_table_v1"

semaphore = asyncio.Semaphore(20)

# JWT Token For Download File
CMS_GET_ASSETS_TOKEN = os.getenv('CMS_GET_ASSETS_TOKEN', None)

llm = LLMChat("anthropic.claude-3-5-sonnet-20241022-v2:0")
client = llm.client
def get_extension_file(url):
    try:
        ext_file = get_extention_file_from_url(url)
        output_file_path = download_file(url)
        if ext_file["status"]:
            return output_file_path, ext_file["ext"]
        else:

            validator = magic.Magic(uncompress=True, mime=True)
            file_type = validator.from_file(output_file_path)
            extension = mimetypes.guess_extension(file_type, strict=True).replace('.', '')

            if extension and extension != 'txt' or extension == None:
                return output_file_path, extension
            else:
                file = open(output_file_path, "r", encoding="utf8", errors="ignore")
                data = file.read()
                is_json = is_json_file(data)
                file.close()
                if is_json["status"]:
                    return output_file_path, is_json["ext"]

                is_csv = is_csv_file(output_file_path)
                if is_csv["status"]:
                    return output_file_path, is_csv["ext"]
                return output_file_path, 'txt'
    except BaseException as e:
        print(e)
        return None, 'txt'

def download_file(url):
    # Download file
    headers = {
        'Authorization': f'Bearer {CMS_GET_ASSETS_TOKEN}'
    }

    if not CMS_GET_ASSETS_TOKEN:
        data = requests.get(url, stream=True)
    else:
        data = requests.get(url, headers=headers, stream=True)
    data.raise_for_status()
    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        for chunk in data.iter_content(chunk_size=8192):
            if chunk:
                temp_file.write(chunk)

        output_file_path = temp_file.name

    return output_file_path

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


async def summarize_documents(document):
    async with semaphore:
        data = document.page_content
        if len(document.page_content) >= 3000:
            message_template = f"""
You are an AI assistant specializing in structured key-value data processing. Your task is to generate a summary of the given input text while ensuring the following:

Preserve all key-value pairs that contain data; no key with data should be omitted.
Maintain the original context accurately, ensuring that no critical information is lost.
If a key has multiple values, summarize concisely while keeping essential details intact.
If applicable, reorganize the data into logical categories for improved readability.
Do not add new information or alter the meaning of the data.
Please provide the summary in Japanese.

Here is the input data:
{document.page_content}
"""
            count = 0
            while True:
                try:
                    result = await llm.ainvoke(message_template)
                    data = result.content
                    break
                except client.exceptions.ValidationException as e:
                    print("Input too long cant summarize")
                    raise
                except Exception as e:
                    count += 1
                    print(f"Retry summary data at {count + 1}")
                    await asyncio.sleep(40)
                    if count >= 5:
                        print("Cant summary data")
                        break
        return data


async def process_vectorize_event(documents):
    print("[VECTORIZE] calling process vectorize event")
    embeddings = load_embeddings("amazon.titan-embed-text-v2:0")

    chunk_task = [documents[i: i + 10] for i in range(0, len(documents), 10)]
    embeds = []
    for chunk in chunk_task:
        chunk_summary_contents = [summarize_documents(doc) for doc in chunk]
        results = await asyncio.gather(*chunk_summary_contents)
        chunk_embeds = embeddings.embed_documents([content for content in results])
        embeds.extend(chunk_embeds)
        await asyncio.sleep(5)
    texts = [d.page_content for d in documents]
    metadatas = [d.metadata for d in documents]
    vectorstore = load_vector_store()
    file_ids = [meta.get("file_id") for meta in metadatas]

    if len(file_ids) > 0:
        existing_ids = get_existing_ids(vectorstore, file_ids[0])
        print("Existing ids", existing_ids)
    else:
        existing_ids = None
    if existing_ids is not None:
        print("Delete vectorstore")
        delete_vectorstore(vectorstore, file_ids[0])

    await asyncio.sleep(1)
    ids = vectorstore.add_texts_with_embeddings(
        texts=texts,
        embs=embeds,
        metadatas=metadatas
    )
    return ids

def delete_vectorstore(vectorstore, file_id):
    try:
        client = vectorstore._bq_client
        query = f"""
            DELETE FROM `{PROJECT_ID}.{DATASET_NAME}.{TABLE_NAME}`
            WHERE file_id = '{file_id}'
        """

        query_job = client.query(query)
        query_job.result()
    except Exception as e:
        print("Delete vectorstore error: ", str(e)) 

def get_existing_ids(vectorstore, file_id):
    try:
        client = vectorstore._bq_client

        query = f"""
            SELECT file_id, doc_id
            FROM `{PROJECT_ID}.{DATASET_NAME}.{TABLE_NAME}`
            WHERE file_id = '{file_id}'
        """

        results = client.query(query).result()
        file = []
        for row in results:
            file.append(row.doc_id)
        if len(file) > 0:
            return {file_id: file}
        return None
    except Exception as e:
        print("Get vectorstore error: ", str(e)) 

def process_dataframe_to_doc(dfs: list[pd.DataFrame], file_id, file_url):
    documents = []
    for df in dfs:
        new_df = pd.DataFrame()
        new_df['page_content'] = df.apply(
            lambda row: "\n".join([f"{col}: {str(row[col])}" for col in df.columns if col != "page_content"]), axis=1)
        new_df['file_id'] = file_id
        new_df['file_url'] = file_url
        new_df['_src_name'] = df['_src_name'].astype(str).fillna('') if '_src_name' in df else pd.Series([''] * len(df))
        new_df['_src_url'] = df['_src_url'].astype(str).fillna('') if '_src_url' in df else pd.Series([''] * len(df))
        new_df['_src_id'] = df['_src_id'].astype(str).fillna('') if '_src_id' in df else pd.Series([''] * len(df))
        print(f"_____MAX: {new_df['page_content'].astype(str).str.len().max()}")
        loader = DataFrameLoader(new_df, page_content_column="page_content")
        data = loader.load()
        documents.extend(data)
    return documents

def vectorize_event(message):
    ticket_id = None
    output_file_path = None
    try:
        request = json.loads(message)
        ticket_id = request["ticketId"]

        file_id = request.get("id", None)
        input_url = request.get("input", None)
        output_file_path, input_type = get_extension_file(input_url)
        if output_file_path is None or output_file_path is None:
            raise Exception("ファイルをダウンロードできませんでした。")
        else:
            input_url = output_file_path
        print(f"TYPE OF FILE INPUT: {input_type}")
        if input_type is not None and input_type == 'json':
            df = pd.read_json(input_url)
        elif input_type is not None and input_type == 'geojson':
            df = gpd.read_file(input_url)
            df.drop(columns=["geometry"], inplace=True)
        elif input_type is not None and input_type == 'csv':
            df = pd.read_csv(input_url)
        else:
            raise ValueError("ファイル形式はサポートされていません。JSONまたはGeoJSONのみサポートされています")

        page_content_col = df.apply(
            lambda row: "\n".join([f"{col}: {str(row[col])}" for col in df.columns if col != "page_content"]), axis=1)
        max_length = page_content_col.astype(str).str.len().max()
        print(f"_____MAX_LENGTH: {max_length}")
        if max_length > 40000:
            #Chunk data overlap
            df['_src_name'] = df['_src_name'].astype(str).fillna('') if '_src_name' in df else pd.Series([''] * len(df))
            df['_src_url'] = df['_src_url'].astype(str).fillna('') if '_src_url' in df else pd.Series([''] * len(df))
            df['_src_id'] = df['_src_id'].astype(str).fillna('') if '_src_id' in df else pd.Series([''] * len(df))
            num_chunk = math.ceil(max_length / 10000)
            columns_number = df.shape[1]
            number_indentity_columns = math.ceil(columns_number * 0.015)
            indentity_cols = df.columns[:number_indentity_columns].tolist()
            indentity_cols.extend(['_src_name', '_src_url', '_src_id'])
            other_cols = [col for col in df.columns if col not in indentity_cols]
            number_column_per_chunk = math.ceil(len(other_cols) / num_chunk)
            column_chunks = [other_cols[i: i + number_column_per_chunk] for i in range(0, len(other_cols), number_column_per_chunk)]
            dfs = [df[indentity_cols + chunk] for chunk in column_chunks]
        else:
            dfs = [df]

        data = process_dataframe_to_doc(dfs, file_id, request.get("input", None))

        ids = asyncio.run(process_vectorize_event(data))
        data_vectorize = []
        for i, e in enumerate(ids):
            dict_data = {"page_content": data[i].page_content, "file_id": data[i].metadata.get("file_id"),
                         "file_url": data[i].metadata.get("file_url"), "_id": e}
            data_vectorize.append(dict_data)

        call_api_endpoint(data_vectorize, ticket_id, request.get("apiEndpoint"))

        update_information({"process": "Completed", "message": "処理が成功しました。"}, ticket_id)

    except ValueError as e:

        req = {
            'status': 'error',
            "process": "Failed",
            "message": str(e)
        }
        update_information(req, ticket_id)

    except BaseException as e:
        print(e)

        req = {
            'status': 'error',
            "process": "Failed",
            "message": "処理に失敗しました。入力データを確認するか、サポートにお問い合わせください。"
        }
        update_information(req, ticket_id)
    finally:
        if output_file_path is not None and os.path.exists(output_file_path):
            os.remove(output_file_path)


def load_vector_store(model_id: str = "amazon.titan-embed-text-v2:0"):
    embeddings = load_embeddings(model_id)
    return BigQueryVectorStore(
        project_id=PROJECT_ID,
        dataset_name=DATASET_NAME,
        table_name=TABLE_NAME,
        location=REGION,
        embedding=embeddings
    )


def load_client():
    return boto3.client(
        "bedrock-runtime",
        region_name="ap-northeast-1",
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    )


def load_embeddings(model_id: str):
    return BedrockEmbeddings(
        client=load_client(),
        model_id=model_id,
    )


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


def call_api_endpoint(data, ticketId, api_endpoint):
    try:
        request = OrderedDict({
            "ticketId": ticketId,
            "schema": {
                "type": "object",
                "properties": {
                    "_id": {
                        "name": "_id",
                        "type": "string"
                    },
                    "text": {
                        "name": "text",
                        "type": "string"
                    },
                    "metadata": {
                        "type": "object",
                        "properties": {
                            "file_id": {
                                "name": "file_id",
                                "type": "string"
                            },
                            "file_url": {
                                "name": "file_url",
                                "type": "string"
                            }
                        }
                    }
                }
            },
            "data": data
        })

        print(f'request {request}')
        time.sleep(5)
        response = requests.post(api_endpoint, json=request)
        print("response", response)
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
        raise Exception(http_err)
    except BaseException as err:
        print(f"Other error occurred: {err}")
        raise Exception(err)


# Define main script
def main():
    print(f"Starting Task #{TASK_INDEX}, Attempt #{TASK_ATTEMPT}...")
    if DMS_DATA:
        print("[DMS_DATA]", DMS_DATA)
        vectorize_event(DMS_DATA)
    else:
        print("No data provided")

    print(f"Completed Task #{TASK_INDEX}.")


# Start script
if __name__ == "__main__":
    try:
        main()
    except Exception as err:
        message = (
                f"Task #{TASK_INDEX}, " + f"Attempt #{TASK_ATTEMPT} failed: {str(err)}"
        )

        print(json.dumps({"message": message, "severity": "ERROR"}))
        sys.exit(1)  # Retry Job Task by exiting the process

    sys.exit(0)
