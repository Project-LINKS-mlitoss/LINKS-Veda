import sys
import json
import time
import pandas as pd
import geopandas as gpd
import os
from pymongo import MongoClient
from datetime import datetime, timezone
import requests
from json import JSONDecoder
from collections import OrderedDict
import magic
import mimetypes
import tempfile
from urllib.parse import quote_plus

custom_json_decoder = JSONDecoder(object_pairs_hook=OrderedDict)
MONGO_CLIENT = f"mongodb://{os.getenv('MONGO_CLIENT')}"
PASSWORD_MONGODB = os.getenv('PASSWORD_MONGODB')
USER_AUTH = os.getenv('USER_AUTH')
MONGO_DB = os.getenv('MONGO_DB')
MONGO_COLLECTION = os.getenv('MONGO_COLLECTION')

# Retrieve Job-defined env vars
TASK_INDEX = os.getenv("CLOUD_RUN_TASK_INDEX", 0)
TASK_ATTEMPT = os.getenv("CLOUD_RUN_TASK_ATTEMPT", 0)
# Retrieve User-defined env vars
DMS_DATA = os.getenv("DMS_DATA", "")

# JWT Token For Download File
CMS_GET_ASSETS_TOKEN = os.getenv('CMS_GET_ASSETS_TOKEN', None)


def cross_tabulation(input, file_extension, key_fields, fields):
    try:
        if (file_extension == 'json'):
            df = pd.read_json(input, dtype=object)
        else:
            df = gpd.read_file(input)
        agg_dict = {}
        columns = []
        cross_tab = []
        numeric_aggregates = []
        for field in fields:
            field_name = field['name']
            if field.get('sum', False) or field.get('avg', False):
                df[field_name] = pd.to_numeric(df[field_name], errors='coerce')
                df[field_name] = df[field_name].fillna(0)

            aggregations = []

            if field.get('sum', False):
                aggregations.append('sum')
            if field.get('avg', False):
                aggregations.append('mean')
            if field.get('cnt', False):
                columns.append(df[field_name])

            # Add to the dictionary
            if aggregations:  # Ensure the list is not empty
                agg_dict[field_name] = aggregations

        if columns:
            index = []
            # カテゴリカルデータのクロス集計（カウント）
            for key_field in key_fields:
                index.append(df[key_field])

            cross_tab = pd.crosstab(index, columns, margins=True, margins_name='Total')

        if agg_dict:
            numeric_aggregates = df.groupby(key_fields).agg(agg_dict).rename(
                columns={'mean': 'avg'}).reset_index()

        return cross_tab, numeric_aggregates
    except BaseException as e:
        raise Exception(f"クロス集計処理中にエラーが発生しました。データ形式が無効（数値フィールドに文字が含まれている可能性）またはキー項目が不足しています。入力ファイルのデータ形式を確認し、キー項目が含まれていることを確認してください。問題が解決しない場合は、サポートにお問い合わせください。")


def convert_numeric_agg_to_json(data, key_fields):
    try:
        result = []
        for _, row in data.iterrows():
            record = {}
            for col in data.columns.levels[0]:
                if col in key_fields:
                    record[col] = row[col]['']
                else:
                    record[col] = {agg: row[(col, agg)] for agg in data[col].columns}
            result.append(record)

        return result
    except BaseException as e:
        raise Exception(f"Error function convert_numeric_agg_to_json: {e}")


def crosstab_to_json(crosstab):
    try:
        result = {}

        # Determine the level of indexes and columns
        index_levels = list(crosstab.index.names)
        column_levels = list(crosstab.columns.names)

        # Handling index levels
        for index in crosstab.index:
            current_level = result
            if isinstance(index, tuple):
                for level, name in zip(index_levels, index):
                    if name not in current_level:
                        current_level[name] = {}
                    current_level = current_level[name]
            else:
                if index not in current_level:
                    current_level[index] = {}
                current_level = current_level[index]

            # Handling the case where there is only one level for columns
            if len(column_levels) == 1:
                for column in crosstab.columns:
                    if column not in current_level:
                        current_level[column] = {}
                    current_level[column]['count'] = int(crosstab.loc[index, column])
            else:
                for column in crosstab.columns:
                    col_keys = [key for key in column if key is not None]
                    col_level = current_level

                    for key in col_keys:
                        if key not in col_level:
                            col_level[key] = {}
                        col_level = col_level[key]

                    col_level['count'] = int(crosstab.loc[index, column])

        # Remove empty key if exists
        def clean_empty_keys(d):
            if "" in d:
                empty_key_data = d.pop("")
                d.update(empty_key_data)
            for key, value in d.items():
                if isinstance(value, dict):
                    clean_empty_keys(value)

        clean_empty_keys(result)

        return result
    except BaseException as e:
        raise Exception(f"Error function crosstab_to_json: {e}")


def cross_event(request_data):
    ticket_id = None
    output_file_path = None
    try:
        req = custom_json_decoder.decode(request_data)

        ticket_id = req["ticketId"]
        input_file = req['input']
        key_fields = req['keyFields']
        fields = req['fields']
        api_endpoint = req['apiEndpoint']

        output_file_path, file_extension = get_extension_file(input_file)
        if output_file_path is None:
            raise Exception("ファイルをダウンロードできませんでした。")
        input_file = output_file_path

        # クロス集計の実行
        cross_tab, numeric_aggregates = cross_tabulation(input_file, file_extension, key_fields, fields)
        crosstab_json = []
        if len(cross_tab):
            if isinstance(cross_tab.columns, pd.MultiIndex):
                cross_tab_cl = ["_".join(col) if not "_".join(col).endswith("_") else "_".join(col)[:-1] for col in
                                cross_tab.columns]
                cross_tab_column_group_name = ""
                if cross_tab.columns.names:
                    cross_tab_column_group_name = "_".join(cross_tab.columns.names)
                cross_tab.columns = cross_tab_cl
                if cross_tab_column_group_name:
                    cross_tab.columns.names = [cross_tab_column_group_name]
            new_cross_tab_df = cross_tab.reset_index()
            cross_tab_ordered_dict = OrderedDict()
            crosstab_json = new_cross_tab_df.to_dict(orient='records', into=cross_tab_ordered_dict)

        numeric_aggregates_result = []
        if len(numeric_aggregates):
            numeric_aggregates_cl = ["_".join(col) if not "_".join(col).endswith("_") else "_".join(col)[:-1] for col in
                                     numeric_aggregates.columns]
            numeric_aggregates.columns = numeric_aggregates_cl
            numeric_aggregates_ordered_dict = OrderedDict()
            numeric_aggregates_result = numeric_aggregates.to_dict(orient='records',
                                                                   into=numeric_aggregates_ordered_dict)

        json_result = OrderedDict(
            {
                'countData': numeric_aggregates_result,
                'crossTabData': crosstab_json
            }
        )

        schema = generate_schema(numeric_aggregates_result, crosstab_json)

        call_api_endpoint(json_result, schema, ticket_id, api_endpoint)
        update_information({"process": "Completed", "message": "処理が成功しました。"}, ticket_id)

    except BaseException as e:
        print(f"Error: {e}")
        req = {
            'status': 'error',
            "process": "Failed",
            "message": str(e)
        }
        update_information(req, ticket_id)
    finally:
        if output_file_path is not None and os.path.exists(output_file_path):
            os.remove(output_file_path)


def generate_schema(numeric_aggregates_result, crosstab_json):
    try:
        schema = OrderedDict({
            'type': 'object',
            'properties': {
                'countData':
                    {
                        'name': 'countData',
                        'type': 'array',
                        'properties': generate_properties(numeric_aggregates_result)
                    },
                'crossTabData':
                    {
                        'name': 'crossTabData',
                        'type': 'array',
                        'properties': generate_properties(crosstab_json)
                    }
            }
        })
        return schema
    except BaseException as e:
        raise Exception(e)


def detect_type(value):
    if isinstance(value, str):
        return "string"
    elif isinstance(value, (int, float)):
        return "number"
    elif isinstance(value, list):
        return "array"
    elif isinstance(value, dict):
        return "object"
    elif isinstance(value, type(None)):
        return "string"
    else:
        return "unknown"


def generate_properties(data):
    properties = OrderedDict()
    try:
        if isinstance(data, dict):
            first_element = data
        else:
            first_element = data[0] if len(data) > 0 else {}

        for key, value in first_element.items():
            if isinstance(value, dict):
                nested_properties = generate_properties([value])
                properties[key] = {
                    "name": key,
                    "type": "object",
                    "properties": nested_properties
                }
            elif isinstance(value, list):
                if value:
                    if isinstance(value[0], dict):
                        nested_properties = generate_properties(value)
                        properties[key] = {
                            "name": key,
                            "type": "array",
                            "properties": nested_properties
                        }
                    else:
                        properties[key] = {
                            "name": key,
                            "type": "array",
                        }
                else:
                    properties[key] = {
                        "name": key,
                        "type": "array",
                    }
            else:
                properties[key] = {
                    "name": key,
                    "type": detect_type(value)
                }

    except BaseException as e:
        print(f"Error function generate properties {e}")

    return properties


def call_api_endpoint(data, schema, ticketId, api_endpoint):
    try:
        request = OrderedDict({
            "ticketId": ticketId,
            "schema": schema,
            "data": data
        })
        print(f'request {request}')
        time.sleep(5)
        response = requests.post(api_endpoint, json=request)
        print("response", response)
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
    except BaseException as err:
        print(f"Other error occurred: {err}")


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
                is_csv = is_csv_file(output_file_path)
                if is_csv["status"]:
                    return output_file_path, is_csv["ext"]

                file = open(output_file_path, "r", encoding="utf8", errors="ignore")
                data = file.read()
                is_json = is_json_file(data)
                if is_json["status"]:
                    file.close()
                    return output_file_path, is_json["ext"]

                file.close()
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

# Define main script
def main():
    print(f"Starting Task #{TASK_INDEX}, Attempt #{TASK_ATTEMPT}...")
    print("container updated")
    if DMS_DATA:
        print("[DMS_DATA]", DMS_DATA)
        cross_event(DMS_DATA)
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