import sys
import os
from io import BytesIO
import time
from pymongo import MongoClient
from datetime import datetime, timezone
import geopandas as gpd
import requests
import json
from json import JSONDecoder
from collections import OrderedDict
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

def spatial_aggregate_event(request_data):
    ticket_id = None
    try:
        request = custom_json_decoder.decode(request_data)

        ticket_id = request["ticketId"]
        summarizedGdf = process_spatial(request)
        if len(summarizedGdf) == 0:
            raise ValueError("ポイントとポリゴンをマージする際にデータが存在しません。")
        summarize_json = summarizedGdf.to_json()
        data = custom_json_decoder.decode(summarize_json)
        properties = generate_properties(data)

        call_api_endpoint(data, properties, ticket_id, request["apiEndpoint"])

        update_information({"process": "Completed", "message": "処理が成功しました。"}, ticket_id)

    except BaseException as e:
        print(e)
        req = {
            'status': 'error',
            "process": "Failed",
            "message": str(e)
        }
        update_information(req, ticket_id)


def process_spatial(request):
    try:
        polygon = load_and_process_data(request["inputLeft"], is_left_file=True)
        point = load_and_process_data(request["inputRight"], is_left_file=False)
        key_field = request["keyFields"]
        updated_keys = []

        for index, key in enumerate(key_field):
            if key in polygon.columns and key in point.columns:
                updated_keys.append(f"{key}.1")
            else:
                updated_keys.append(key)

        # 空間結合
        spatial_join_gdf = spatial_join(point, polygon)
        # 小地域に集計

        if len(spatial_join_gdf) < 1:
            return spatial_join_gdf

        aggregation_columns_dict = generate_aggregation_columns(request["fields"])
        summarized_gdf = summarize_polygon_data(spatial_join_gdf, key_field, aggregation_columns_dict, updated_keys)
        #  Change “_mean” to “_avg”
        summarized_gdf.rename(columns={"mean": "avg"}, inplace=True)

        summarized_gdf.columns = [
            col[0] if col[1] == '' else f"{col[0]}_{col[1]}"
            for col in summarized_gdf.columns
        ]

        if updated_keys and updated_keys != key_field:
            rename_dict = dict(zip(updated_keys, key_field))
            summarized_gdf.rename(columns=rename_dict, inplace=True)

        # 小地域ポリゴンに集計結果を結合
        summarized_gdf = polygon.merge(summarized_gdf, how="left", on=request["keyFields"])
        # GeoDataFrameに変換
        summarized_gdf = gpd.GeoDataFrame(summarized_gdf, geometry='geometry', crs="EPSG:4326")
        for column in summarized_gdf.select_dtypes(include=['datetime']).columns:
            summarized_gdf[column] = summarized_gdf[column].astype(str)

        summarized_gdf = count_point_in_polygon(summarized_gdf, key_field, aggregation_columns_dict, polygon,
                                                spatial_join_gdf, updated_keys)
        # 出力
        return summarized_gdf
    except BaseException as e:
        raise Exception(e)


def count_point_in_polygon(gdf, key_field, aggregation_columns_dict, polygons_gdf, joined_data, updated_keys):
    # Filter column count = True from aggregation_columns_dict
    count_cols = {key: value for key, value in aggregation_columns_dict.items() if 'count' in value}
    gdf_data = gdf
    column_merge = key_field
    if updated_keys and updated_keys != key_field:
        key_field = updated_keys

    for key, value in count_cols.items():
        type_counts = joined_data.groupby(key_field)[key].value_counts().unstack(fill_value=0)
        type_counts.columns = [f"{key}_{col}_cnt" for col in type_counts.columns]
        
        polygon_data = polygons_gdf.merge(type_counts, left_on=column_merge, right_index= True)

        # Remove column
        polygon_data = polygon_data.drop(columns=['geometry', 'key_0'], errors="ignore").rename(columns={'geometry_x': 'geometry'}, errors="ignore")
        gdf_data = gdf_data.merge(polygon_data, on=column_merge)
        gdf_data = gdf_data.drop(columns=[f"{key}_count"], errors="ignore")

        new_columns = {}
        for col in gdf_data.columns:
            if col.endswith("_x"):
                new_columns[col] = col.replace("_x", "")
            elif col.endswith("_y"):
                new_columns[col] = col.replace("_y", ".1")

        gdf_data = gdf_data.rename(columns=new_columns, errors="ignore")
    return gdf_data


def generate_aggregation_columns(fields):
    aggregation_dict = {}
    for field in fields:
        aggregation_methods = []
        if field.get("cnt"):
            aggregation_methods.append("count")
        if field.get("sum"):
            aggregation_methods.append("sum")
        if field.get("avg"):
            aggregation_methods.append("mean")

        if aggregation_methods:
            aggregation_dict[field["name"]] = aggregation_methods
    return aggregation_dict


def spatial_join(point_data_gdf, polygon_data_gdf):
    spatial_join_gdf = gpd.sjoin(point_data_gdf, polygon_data_gdf, how="inner", predicate="intersects")
    if len(spatial_join_gdf) > 0:
        spatial_join_gdf.reset_index(inplace=True)
        new_columns = {}
        for col in spatial_join_gdf.columns:
            if col.endswith("_left"):
                new_columns[col] = col.replace("_left", "")
            elif col.endswith("_right"):
                new_columns[col] = col.replace("_right", ".1")

        spatial_join_gdf = spatial_join_gdf.rename(columns=new_columns)

    return spatial_join_gdf


def summarize_polygon_data(gdf, key_field, aggregation_columns_dict, updated_keys):
    if updated_keys and updated_keys != key_field:
        key_field = updated_keys

    summarized_gdf = gdf.groupby(key_field).agg(aggregation_columns_dict)
    if len(summarized_gdf) > 0:
        summarized_gdf.reset_index(inplace=True)
    return summarized_gdf


def load_and_process_data(file_path, is_input_data_1=True, is_left_file=True):
    try:
        gdf = read_geojson(file_path)
        file_type = 'メインデータ' if is_left_file else 'サブデータ'

        if gdf is None or gdf.empty:
            raise ValueError(f"{file_type}ファイルの読み込みに失敗しました。再度ご確認ください。")

        if 'geometry' not in gdf.columns:
            raise KeyError(f"{file_type}に'geometry'列が必要です")

        gdf = gdf[gdf['geometry'].notnull()]

        if is_input_data_1:
            pass

        return gdf
    except BaseException as e:
        raise Exception(e)


def read_geojson(path: str, **kwargs) -> gpd.GeoDataFrame:
    try:
         # Download file
        headers = {
            'Authorization': f'Bearer {CMS_GET_ASSETS_TOKEN}'
        }

        if not CMS_GET_ASSETS_TOKEN:
            response = requests.get(path)
        else:
            response = requests.get(path, headers=headers)
            
        response.raise_for_status()
        bytesIo = BytesIO(response.content)

        gdf = gpd.read_file(bytesIo, **kwargs)
        return gdf
    except BaseException as e:
        print(f"ファイル {path} の読み込み中にエラーが発生しました: {e}")
        return None


def call_api_endpoint(data, properties, ticketId, apiEndpoint):
    try:
        request = OrderedDict({
            "ticketId": ticketId,
            "schema": {
                "type": "object",
                "properties": properties
            },
            "data": data
        })
        print(f"request {request}")
        time.sleep(5)
        response = requests.post(apiEndpoint, json=request)
        print("response", response)
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
    except BaseException as err:
        print(f"Other error occurred: {err}")


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

# Define main script
def main():
    print(f"Starting Task #{TASK_INDEX}, Attempt #{TASK_ATTEMPT}...")
    print("container updated")
    if DMS_DATA:
        print("[DMS_DATA]", DMS_DATA)
        spatial_aggregate_event(DMS_DATA)
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