import json
import time
import sys
import geopandas as gpd
from io import BytesIO

from pymongo import MongoClient
from datetime import datetime, timezone
import pandas as pd
import requests
import os
import math
from json import JSONDecoder
from collections import OrderedDict
from urllib.parse import quote_plus

custom_json_decoder = JSONDecoder(object_pairs_hook=OrderedDict)

WGS84 = 4326
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

def spatial_join_event(request_data):
    ticket_id = None
    try:
        request = custom_json_decoder.decode(request_data)

        ticket_id = request["ticketId"]
        input_left = load_and_process_data(request["inputLeft"])
        input_right = load_and_process_data(request["inputRight"])
        point_selected_column = input_right.columns
        data, _ = assign_points_to_polygon(input_left, input_right, 2, point_selected_column, request,
                                                    1 if request["op"] == "nearest" else 2)
        data = data.apply(
            lambda col: col.dt.strftime(
                '%Y-%m-%d %H:%M:%S.%f') if col.dtype == 'datetime64[ns]' or col.dtype == 'datetime64[ms]' else col
        )
        data_json = data.to_json()
        data = custom_json_decoder.decode(data_json)
        properties = generate_properties(data)

        call_api_endpoint(data, properties, ticket_id, request["apiEndpoint"])
        update_information({"process": "Completed", "message": "処理が成功しました。"}, ticket_id)

    except Exception as e:
        print(e)
        req = {
            'status': 'error',
            "process": "Failed",
            "message": str(e)
        }
        update_information(req, ticket_id)


def get_input_data(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        bytes_io = BytesIO(response.content)
        return bytes_io
    except BaseException as e:
        raise Exception(f"Get file from storage {e}")


def check_duplicate_columns(gdf1: gpd.GeoDataFrame, gdf2: gpd.GeoDataFrame,
                            result_gdf: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    """
    Checks for duplicate column names in the result of a spatial join and renames them

    Parameters
    ----------
    gdf1 : gpd.GeoDataFrame
        The GeoDataFrame on the left side of the spatial join
    gdf2 : gpd.GeoDataFrame
        The GeoDataFrame on the right side of the spatial join
    result_gdf : gpd.GeoDataFrame
        The result of the spatial join

    Returns
    -------
    gpd.GeoDataFrame
        The result of the spatial join with duplicate column names renamed
    """
    gdf1_columns = gdf1.columns
    gdf2_columns = gdf2.columns
    # Check for duplicate column names in the result and rename them
    for column in result_gdf.columns:
        if column in gdf1_columns and column in gdf2_columns and column != 'geometry':
            result_gdf = result_gdf.rename(
                columns={column: f"{column}_gdf1" if column in gdf1_columns else f"{column}_gdf2"})
    return result_gdf


def filter_point_columns(gdf: gpd.GeoDataFrame, initial_columns: list, retain_fields: list) -> list:
    """
    Filters and determines the final set of columns to be used for point selection
    in a GeoDataFrame based on specified fields.

    Parameters
    ----------
    gdf : gpd.GeoDataFrame
        The GeoDataFrame from which columns are to be selected.
    initial_columns : list
        Initial list of columns selected from the GeoDataFrame.
    retain_fields : list
        A list of fields to retain from the GeoDataFrame's columns.

    Returns
    -------
    list
        The final list of columns to be used, including 'geometry' if applicable.
    """
    if retain_fields:
        valid_columns = [field for field in retain_fields if field in gdf.columns]
        if valid_columns:
            valid_columns.append('geometry')
            initial_columns = valid_columns

    return initial_columns


def assign_points_to_polygon(left_gdf, right_gdf, mul, point_selected_column, request, option):
    try:
        keep_right_fields = request.get('keepRightFields', [])
        point_selected_column = filter_point_columns(right_gdf, point_selected_column, keep_right_fields)

        right_gdf = right_gdf[point_selected_column].copy()
        projected_crs = 3857  # EPSG:3857 (Web Mercator) là một lựa chọn phổ biến
        left_gdf = left_gdf.to_crs(epsg=projected_crs)
        target_crs = left_gdf.crs
        right_gdf = right_gdf.to_crs(target_crs)

        left_gdf["centroid"] = left_gdf["geometry"].centroid
        left_gdf["area"] = left_gdf["geometry"].area
        left_gdf["area"] = left_gdf["area"].replace(0, 1)
        rad = (mul * left_gdf["area"] / math.pi) ** 0.5
        left_gdf["buffer"] = left_gdf["centroid"].buffer(rad)
        left_gdf = left_gdf.set_geometry("buffer")

        right_gdf['right_ID'] = range(1, len(right_gdf) + 1)
        geometry_dict = right_gdf.set_index('right_ID')['geometry'].to_dict()

        # Rename columns in gdf2 to avoid conflicts
        right_gdf = right_gdf.rename(columns=lambda x: f"{x}_1" if x in left_gdf.columns and x != 'geometry' else x)

        if option == 1:
            _distance = request.get("distance", None)
            max_distance = _distance * 1000 if _distance else None
            joined = gpd.sjoin_nearest(left_gdf, right_gdf, how='left', max_distance=max_distance)
            joined = check_duplicate_columns(left_gdf, right_gdf, joined)
            joined = joined.set_geometry("geometry")
            combined_gdf = joined.drop(columns=["index_right", "geometry_right", "buffer", "centroid", "area"],
                                       errors="ignore")
        else:
            left_gdf['left_ID'] = range(1, len(left_gdf) + 1)
            joined = gpd.sjoin(left_gdf, right_gdf, how='left', predicate='intersects')
            joined = check_duplicate_columns(left_gdf, right_gdf, joined)
            joined["distance"] = joined.apply(
                lambda row: row["centroid"].distance(geometry_dict[row["right_ID"]]) if not pd.isnull(
                    row["right_ID"]) and row["centroid"] is not None else None,
                axis=1)
            joined = joined.reset_index(drop=True)

            filtered_gdf = joined.dropna(subset=['right_ID'])
            dropped_rows = joined[joined['right_ID'].isna()]

            result_gdf = joined.loc[filtered_gdf.groupby('left_ID')['distance'].idxmin().tolist()]
            combined_gdf = pd.concat([dropped_rows, result_gdf])
            combined_gdf = gpd.GeoDataFrame(combined_gdf, geometry='geometry')
            combined_gdf = combined_gdf.drop(
                columns=["index_left", "left_ID", "centroid", "area", "geometry_right", "index_right", "buffer",
                         "distance"], errors="ignore")

        combined_gdf.to_crs(WGS84, inplace=True)
        num_points = right_gdf.shape[0]
        unique_values_count = combined_gdf["right_ID"].nunique()
        join_ratio = round(unique_values_count / num_points * 100, 2)
        combined_gdf = combined_gdf.drop(columns=["right_ID"])

        return combined_gdf, join_ratio
    except Exception as e:
        raise e


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


def call_api_endpoint(data, properties, ticket_id, apiEndpoint):
    try:
        request = OrderedDict({
            "ticketId": ticket_id,
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
        raise Exception(http_err)
    except BaseException as err:
        print(f"Other error occurred: {err}")
        raise Exception(err)


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


def update_information(data, ticket_id):
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
        collection.update_one({"_id": ticket_id}, {"$set": merged_dict})
    except Exception as e:
        print(f"error {e}")
    finally:
        client.close()

# Define main script
def main():
    print(f"Starting Task #{TASK_INDEX}, Attempt #{TASK_ATTEMPT}...")
    print("container updated")
    if DMS_DATA:
        print("[DMS_DATA]", DMS_DATA)
        spatial_join_event(DMS_DATA)
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