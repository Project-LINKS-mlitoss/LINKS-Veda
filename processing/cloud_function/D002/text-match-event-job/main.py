import os
import sys
import time
from typing import Dict, List
import json
import geopandas as gpd
import pandas as pd
import requests
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pymongo import MongoClient
from datetime import datetime, timezone
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


def load_data(url: str, file_extension: str = 'json') -> pd.DataFrame:
    """Load data from a URL with the given file extension."""

    if file_extension == 'json':
        return pd.read_json(url, dtype=object)
    elif file_extension == 'geojson':
        return gpd.read_file(url)
    else:
        raise ValueError(f"対応していないファイル拡張子です: {file_extension}。サポートされている形式は 'json' または 'geojson' のみです。")


def embedding_address(
        main_data: str,
        sub_data: str,
        keep_right_fields: List[str],
        columns: List[Dict[str, str]],
        threshold: float = 0.5
) -> tuple:
    output_file_left = None
    output_file_right = None
    try:
        main_column = []
        sub_column = []

        for col in columns:
            main_column.append(col["leftField"])
            sub_column.append(col["rightField"])

        output_file_left, left_input_type = get_extension_file(main_data)
        output_file_right, right_input_type = get_extension_file(sub_data)

        if output_file_left is None or output_file_right is None:
            raise Exception("ファイルをダウンロードできませんでした。")

        main_df = load_data(output_file_left, left_input_type)
        sub_df = load_data(output_file_right, right_input_type)

        for col in main_column:
            if col not in main_df.columns:
                raise ValueError(f"メインデータに列 '{col}' が見つかりません。")
            main_df[col] = main_df[col].astype(str)

        for col in sub_column:
            if col not in sub_df.columns:
                raise ValueError(f"サブデータに列 '{col}' が見つかりません。  ")
            sub_df[col] = sub_df[col].astype(str)

        data_rows = len(main_df)  # データの行数、完全一致割合の計算に使用

        # 結合元のファイル名を取得(suido.jsonだったらsuidoだけ取り出して、列名を'水道使用量_suido'みたいにする) # noqa: E501
        if keep_right_fields:
            keep_right_fields.extend(sub_column)
            valid_columns = [col for col in keep_right_fields if col in sub_df.columns.tolist()]
            if valid_columns:
                sub_df = sub_df[valid_columns]

        sub_df.columns = [
            f"{col}.1" if col not in sub_column else col for col in sub_df.columns
        ]

        # 名寄せ対象になる行を元情報として残す
        for index, col in enumerate(sub_column):
            sub_df[f"{col}.1"] = sub_df[col]
            sub_df.rename(columns={col: main_column[index]}, inplace=True)  # noqa: PD002

        merge_right_columns = [f"{col}.1"for col in sub_column]
        # 重複を削除し、一意にする。ここは直接指示を受けて追加した部分。
        sub_df = sub_df.drop_duplicates(subset=merge_right_columns)
        main_df = main_df.drop_duplicates(subset=main_column)

        # 完全一致による結合
        df_merge = main_df.merge(sub_df, how="left", on=main_column)
        merged_rows = df_merge[merge_right_columns].notna().all(axis = 1).sum()
        not_merged = len(df_merge) - merged_rows

        complete_match_ratio = (merged_rows / data_rows)
        sub_df = sub_df[~sub_df.set_index(main_column).index.isin(df_merge.set_index(main_column).index)]

        sub_df = sub_df.reset_index(drop=True)
        # 完全一致できた行数

        ngram_rows = 0  # ngramで名寄せできた行数をカウント
        if not_merged != 0:
            # N-gramで類似度を計算、閾値以上の場合、結合対象の列を追加、閾値未満の場合は空白
            vectorizer = CountVectorizer(analyzer="char", ngram_range=(2, 2))

            main_df["combined_column"] = main_df[main_column].apply(lambda row: ' '.join(row.values.astype(str)),
                                                                    axis=1)
            sub_df["combined_column"] = sub_df[main_column].apply(lambda row: ' '.join(row.values.astype(str)), axis=1)

            main_df_ngram_matrix = vectorizer.fit_transform(main_df["combined_column"].astype(str))
            sub_df_ngram_matrix = vectorizer.transform(sub_df["combined_column"].astype(str))

            similarities = cosine_similarity(main_df_ngram_matrix, sub_df_ngram_matrix)
            sub_df.drop(columns=sub_column, inplace=True, errors='ignore')

            for i in range(len(main_df)):
                top_indices = similarities[i].argsort()[-3:][::-1]
                if similarities[i][top_indices[0]] >= threshold:
                    for col in sub_df.columns:
                        main_df.at[i, col] = sub_df.iloc[top_indices[0]][col]  # noqa: PD008

                    ngram_rows += 1
            main_df.drop(columns=["combined_column"], inplace=True)

            main_df.replace("nan", None, inplace=True)
            df_merge.set_index(main_column)
            main_df.set_index(main_column)
        if left_input_type == 'json':
            result_df = df_merge.fillna(main_df)
        else:
            filled_df = df_merge.fillna(main_df)
            result_df = gpd.GeoDataFrame(filled_df)
        df_merge.reset_index(inplace=True)
        main_df.reset_index(inplace=True)
        flag_columns = [col for col in result_df.columns if "flag" in col]
        other_columns = [col for col in result_df.columns if "flag" not in col]
        result_df = result_df[other_columns + flag_columns]
        # re-order right columns after left columns
        for i in range(0, len(main_column)):
            left_column_name = main_column[i]
            right_column_name = f"{sub_column[i]}.1"
            cols = result_df.columns.to_list()
            if left_column_name not in cols or right_column_name not in cols:
                continue
            cols.remove(right_column_name)
            insert_at = cols.index(left_column_name) + 1
            cols.insert(insert_at, right_column_name)
            result_df = result_df[cols]


        if left_input_type == 'json':
            json_data = result_df.to_json(orient='records', force_ascii=False, default_handler=str)
        else:
            result_df = result_df.drop(columns=["geometry.1"], errors='ignore')
            json_data = result_df.to_json()

        data = custom_json_decoder.decode(json_data)

        # 結果の表示
        if not_merged == 0:
            threshold_match = 0
            match_rate = complete_match_ratio
        else:
            threshold_match = ngram_rows / data_rows
            match_rate = round(complete_match_ratio + threshold_match, 2)

        complete_match_ratio = f"完全一致割合: {complete_match_ratio * 100:.2f}%"
        threshold_match_ratio = (
            f"閾値以上結合割合: {threshold_match * 100:.2f}%"
        )

        print(f"{complete_match_ratio}\n{threshold_match_ratio}")

        res = {
            'match_rate': match_rate,
            'matched_data': data
        }
        schema = generate_schema(res)

        return res, schema, left_input_type

    except BaseException as err:
        print(f"Error function embedding_address: {err}")
        raise Exception(err)
    finally:
        if output_file_left is not None and os.path.exists(output_file_left):
            os.remove(output_file_left)
        if output_file_right is not None and os.path.exists(output_file_right):
            os.remove(output_file_right)


def generate_schema(res):
    try:
        schema = {
            'type': 'object',
            'properties': {
                'match_rate':
                    {
                        'name': 'match_rate',
                        'type': detect_type(res['match_rate'])
                    },
                'matched_data':
                    {
                        'name': 'matched_data',
                        'type': detect_type(res['matched_data']),
                        'properties': generate_properties(res['matched_data'])
                    }
            }
        }
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
        if isinstance(data, dict) and 'features' in data:
            first_feature = data['features'][0] if len(data['features']) > 0 else None
            if first_feature and 'properties' in first_feature:
                first_element = first_feature['properties']
        elif not data or not isinstance(data, list) or not isinstance(data[0], dict):
            raise ValueError("Input data must be a list of objects, with at least one element.")
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


def call_api_endpoint(data, schema, ticketId, api_endpoint, file_extension):
    try:
        request = OrderedDict({
            "ticketId": ticketId,
            "responseType": file_extension,
            "schema": schema,
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


def text_match_event(request_data):
    ticket_id = None
    try:
        req = custom_json_decoder.decode(request_data)

        ticket_id = req["ticketId"]
        input_left = req['inputLeft']
        input_right = req['inputRight']
        columns = req['where']
        threshold = req['threshold']
        api_endpoint = req['apiEndpoint']
        keep_right_fields = req.get('keepRightFields', [])

        data, schema, response_type = embedding_address(input_left, input_right, keep_right_fields, columns,
                                                        threshold)

        call_api_endpoint(data, schema, ticket_id, api_endpoint, response_type)
        update_information({"process": "Completed", "message": "処理が完了しました"}, ticket_id)
    except Exception as e:
        print(f"Error: {e}")
        req = {
            'status': 'error',
            "process": "Failed",
            "message": str(e)
        }
        update_information(req, ticket_id)


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
    except Exception as e:
        print(f"error {e}")
    finally:
        client.close()


# Function get extension file
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

            if extension and extension != 'txt':
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
        text_match_event(DMS_DATA)
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