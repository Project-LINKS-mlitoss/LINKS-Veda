import numpy as np
import pandas as pd
import geopandas as gpd
import time
from collections import OrderedDict
from pymongo import MongoClient
from json import JSONDecoder
from datetime import datetime, timezone
import requests
import tempfile
import os
import json
import uuid
import re
import sys
import magic
import mimetypes
from urllib.parse import quote_plus

custom_json_decoder = JSONDecoder(object_pairs_hook=OrderedDict)
MONGO_CLIENT = f"mongodb://{os.getenv('MONGO_CLIENT')}"
PASSWORD_MONGODB = os.getenv('PASSWORD_MONGODB')
USER_AUTH = os.getenv('USER_AUTH')
MONGO_DB = os.getenv('MONGO_DB')
MONGO_COLLECTION = os.getenv('MONGO_COLLECTION')

MASKING_ID_POSTFIX = 'ID'
MASKING_ADDRESS_POSTFIX = '_秘匿化'
MASKING_RANKING_POSTFIX = '_ランク'
MASKING_DEVIATION_POSTFIX = '_偏差値'

# Retrieve Job-defined env vars
TASK_INDEX = os.getenv("CLOUD_RUN_TASK_INDEX", 0)
TASK_ATTEMPT = os.getenv("CLOUD_RUN_TASK_ATTEMPT", 0)
# Retrieve User-defined env vars
DMS_DATA = os.getenv("DMS_DATA", "")

# JWT Token For Download File
CMS_GET_ASSETS_TOKEN = os.getenv('CMS_GET_ASSETS_TOKEN', None)

def masking_data_event(request_data):
    ticket_id = None
    output_file_path = None
    try:
        req = custom_json_decoder.decode(request_data)
        input_file = req['input']
        api_endpoint = req['apiEndpoint']
        option = req['option']
        ticket_id = req["ticketId"]
        output_file_path, file_extension = get_extension_file(input_file)
        if output_file_path is None:
            raise Exception("ファイルをダウンロードできませんでした。")
        input_file = output_file_path

        if file_extension == 'json' or file_extension == 'geojson':
            data, data_ranking = handle_masking_data(input_file, file_extension, option)
            schema = generate_schema(data)
            json_data = json.loads(data)

            call_api_endpoint(json_data, data_ranking, schema, ticket_id, api_endpoint)
            update_information({"process": "Completed", "message": "処理が成功しました。"}, ticket_id)
    except Exception as e:
        req = {
            'status': 'error',
            "process": "Failed",
            "message": "入力データに問題が発生しました。データを確認するか、サポートにお問い合わせください。"
        }
        update_information(req, ticket_id)
    finally:
        if output_file_path is not None and os.path.exists(output_file_path):
            os.remove(output_file_path)


def pandas_ranking(rank_col, group_labels, max_rank):
    rank_col = rank_col.apply(lambda x: x if isinstance(x, (int, float)) else None)
    null_mask = rank_col.isnull()
    rank_col = rank_col.infer_objects(copy=False).fillna(0)
    _, qcut_bins = pd.qcut(rank_col, max_rank, duplicates='drop', retbins=True)
    ranked_col, rank_bin = pd.qcut(rank_col, max_rank, labels=group_labels[:len(qcut_bins) - 1], duplicates='drop',
                                   retbins=True)
    ranked_col = ranked_col.cat.add_categories([0])
    ranked_col = ranked_col.where(~null_mask, 0)
    rank_type = type(max_rank)
    ranked_col = ranked_col.astype(rank_type)

    return ranked_col, rank_bin


def handle_ranking(opt, field_name, rank_col):
    max_rank = opt.get('max_rank')
    data_ranking = []
    if not max_rank or max_rank < 2 or max_rank > 10:
        print('Invalid max_rank')
        return None, None, data_ranking

    ranked_col_name = f'{field_name}{MASKING_RANKING_POSTFIX}'

    rank_ranges = opt.get('rank_ranges')
    if rank_ranges is not None:
        if len(rank_ranges) != max_rank:
            print('Invalid rank_ranges')
            return None, None, data_ranking

        rank_ranges = sort_rank_ranges(rank_ranges)
        ranked_col = rank_col.apply(lambda x: rank_convert(value=x, max_rank=max_rank, sorted_rank_ranges=rank_ranges))
        for i in range(max_rank):
            data_ranking.append(
                {
                    'min': rank_ranges[i]['min'],
                    'max': rank_ranges[i]['max'],
                    'rank': i + 1
                }
            )
    else:
        group_labels = create_group_labels(max_rank)
        ranked_col, rank_bin = pandas_ranking(rank_col, group_labels, max_rank)
        for i in range(len(rank_bin) - 1):
            data_ranking.append(
                {
                    'min': int(np.ceil(rank_bin[i])),
                    'max': int(np.ceil(rank_bin[i + 1])),
                    'rank': int(group_labels[i])
                }
            )

    return ranked_col_name, ranked_col, data_ranking


def get_input_data(input_file, file_extension):
    if file_extension == 'json':
        df = pd.read_json(input_file, dtype=object)
    else:
        df = gpd.read_file(input_file)
    return df


def handle_masking_data(input_file, file_extension, option):
    try:
        df = get_input_data(input_file, file_extension)
        masked_cols = {}
        cols_order = df.columns.tolist()
        data_ranking = {}

        for opt in option:
            print('[opt]', opt)
            field = opt['field']
            df_cols = df.columns
            if field not in df_cols:
                print(f"Field '{field}' does not exist in DataFrame.")
                continue
            new_index = cols_order.index(field) + 1
            masked_col_name = None
            masked_col = None
            _data_ranking = None

            match opt['type']:
                case 'masking_id':
                    prefix = opt["prefix"] if "prefix" in opt and opt["prefix"] != "" else ""
                    masked_col_name, masked_col = masking_id(df[field], field, prefix)

                case 'masking_address':
                    masked_col_name, masked_col = masking_address(df[field], field)
                case 'ranking':
                    masked_col_name, masked_col, _data_ranking = handle_ranking(opt, field, df[field])

                case 'deviation_val':
                    masked_col_name, masked_col = deviation_val(df[field], field)

            if masked_col_name is not None and masked_col is not None:
                masked_cols[masked_col_name] = masked_col
                cols_order.insert(new_index, masked_col_name)
                if _data_ranking:
                    data_ranking[field] = _data_ranking

        if masked_cols:
            masked_cols = pd.DataFrame(masked_cols)
            df = pd.concat([df, masked_cols], axis=1)
        df = df[cols_order]
        json_data = df.to_json(force_ascii=False, orient='records', indent=4)
        return json_data, data_ranking
    except Exception as e:
        print(e)


def masking_id(list_id, old_column, prefix):
    list_uuid = []
    for value in list_id:
        str_uuid = str(uuid.uuid4())
        if prefix != "":
            str_uuid = prefix + str_uuid
        list_uuid.append(str_uuid)

    new_column = f'{old_column}{MASKING_ID_POSTFIX}'
    return new_column, list_uuid


def masking_address(list_address, old_column):
    mask_address = []
    # Regular expression to extract province/city and ward
    pattern = r"(\S+?市|\S+?区|\S+?町|\S+?村)"

    for value in list_address:
        if value:
            matches = re.findall(pattern, value)
            if matches:
                # Join matched parts to create the masked address
                result = " ".join(matches)
                mask_address.append(result)
            else:
                mask_address.append(None)
        else:
            mask_address.append(None)

    new_column = f"{old_column}{MASKING_ADDRESS_POSTFIX}"
    return new_column, mask_address


def sort_rank_ranges(rank_ranges):
    sorted_rank_ranges = sorted(rank_ranges, key=lambda x: x['min'] if x['min'] is not None else float('-inf'))
    return sorted_rank_ranges


def rank_convert(value, sorted_rank_ranges, max_rank):
    try:
        rank = 0
        for i in range(max_rank):
            rank_range = sorted_rank_ranges[i]
            min_value = rank_range['min'] if rank_range['min'] is not None else float('-inf')
            max_value = rank_range['max'] if rank_range['max'] is not None else float('inf')

            if min_value <= value < max_value:
                rank = i + 1
                break

        return rank
    except Exception as e:
        print(f'[rank_convert][Exception] when convert value:{value}', e)
        return 0


def create_group_labels(max_rank):
    group_labels = []
    for i in range(max_rank):
        group_labels.append(str(i + 1))

    return group_labels


def deviation_val(data, old_column):
    data = data.apply(lambda x: x if isinstance(x, (int, float)) else None)
    data = data.infer_objects(copy=False).fillna(0)
    mean = data.mean()
    std = data.std(ddof=0)
    if std == 0:
        deviation = data.infer_objects(copy=False).fillna(0)
    else:
        scaled = (data - mean) / std * 10 + 50
        deviation = scaled.infer_objects(copy=False).fillna(0)

    new_column = f'{old_column}{MASKING_DEVIATION_POSTFIX}'
    return new_column, deviation


def generate_schema(masking_data_json):
    try:
        schema = OrderedDict({
            'type': 'array',
            'properties': generate_properties(custom_json_decoder.decode(masking_data_json))
        })
        return schema
    except BaseException as e:
        raise Exception(e)


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


def call_api_endpoint(data, data_ranking, schema, ticketId, api_endpoint):
    try:
        request = OrderedDict({
            "ticketId": ticketId,
            "schema": schema,
            "data": data,
            "dataRanking": data_ranking
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
    try:
        json_data = json.loads(file_data)
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
        masking_data_event(DMS_DATA)
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
