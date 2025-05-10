import asyncio
import io
import mimetypes
from io import BytesIO, StringIO
from typing import Tuple

import aiohttp
import magic
from shapely.geometry import MultiPolygon, Polygon, shape
from shapely import wkt
from pymongo import MongoClient
from datetime import datetime, timezone
import json
import pandas as pd
import geopandas as gpd
import re
import requests
import time
import sys
from shapely.geometry import Point
import os
from pyogrio.errors import DataSourceError
import zipfile
import tempfile
from json import JSONDecoder
from collections import OrderedDict
from urllib.parse import quote_plus
from utils import detect_outliers, convert_to_year, convert_date_to_gregorian

semaphore = asyncio.Semaphore(20)
custom_json_decoder = JSONDecoder(object_pairs_hook=OrderedDict)
AWS_LOCATION_SERVICE_API_KEY = os.getenv('AWS_LOCATION_SERVICE_API_KEY')
AWS_LOCATION_SERVICE_API_ENDPOINT = os.getenv('AWS_LOCATION_SERVICE_API_ENDPOINT')
MONGO_CLIENT = f"mongodb://{os.getenv('MONGO_CLIENT')}"
PASSWORD_MONGODB = os.getenv('PASSWORD_MONGODB')
USER_AUTH = os.getenv('USER_AUTH')
MONGO_DB = os.getenv('MONGO_DB')
MONGO_COLLECTION = os.getenv('MONGO_COLLECTION')
CMS_GET_ASSETS_TOKEN = os.getenv("CMS_GET_ASSETS_TOKEN", "")
# Retrieve Job-defined env vars
TASK_INDEX = os.getenv("CLOUD_RUN_TASK_INDEX", 0)
TASK_ATTEMPT = os.getenv("CLOUD_RUN_TASK_ATTEMPT", 0)
# Retrieve User-defined env vars
DMS_DATA = os.getenv("DMS_DATA", "")

LATITUDE_POSTFIX = "_緯度"
LONGITUDE_POSTFIX = "_軽度"


def cleansing_data(request_data):
    ticket_id = None
    try:
        request = custom_json_decoder.decode(request_data)
        ticket_id = request["ticketId"]
        update_information({"process": "Processing"}, request["ticketId"])
        try:
            data, type_file = get_input_data(request)
        except Exception as e:
            req = {
                'status': 'error',
                "process": "Failed",
                'message': "ファイルを処理するためにダウンロードできませんでした。"
            }
            update_information(req, ticket_id)
            return
        document_name = request.get("documentName", None)

        geocoding = request.get("geocoding", None)
        if type_file in ['shapefile', 'geojson']:
            to_geojson_file = True
        elif geocoding is not None and geocoding:
            to_geojson_file = geocoding.get("toGeojson", True)
        else:
            to_geojson_file = False

        data = preprocess_data(request, data, type_file)
        data_json = data
        if isinstance(data, str):
            data_json = custom_json_decoder.decode(data)
        data_json = append_document_name(data_json, document_name, to_geojson_file)
        properties = generate_properties(data_json)

        call_api_endpoint(data_json, properties, request["ticketId"], request["apiEndpoint"])

        update_information({"process": "Completed", "message": "処理が成功しました。"}, request["ticketId"])

        return data_json
    except Exception as e:
        print(f"Error: {e}")
        if any(isinstance(arg, Exception) for arg in e.args):
            message = str(e)
        else:
            message = "入力データに問題が発生しました。データを確認するか、サポートにお問い合わせください。"
        req = {
            'status': 'error',
            "process": "Failed",
            'message': message
        }
        update_information(req, ticket_id)


def preprocess_data(request, data, type_file):
    try:
        normalizeCrs = request.get("normalizeCrs", None)
        if type_file == "shapefile":
            if normalizeCrs is not None and normalizeCrs:
                data = crs_normalise_function(data)
        else:
            cleansing = request.get("cleansing", None)
            geocoding = request.get("geocoding", None)
            if cleansing is not None and cleansing:
                data = cleansing_function(request, data, type_file)
            if geocoding is not None and geocoding:
                data = geocoding_function(request, data, type_file)
            if normalizeCrs is not None and normalizeCrs and (
                    type_file == "geojson" or (type_file == "json" and geocoding and geocoding is not None)):
                data = crs_normalise_function(data)

        return data
    except BaseException as e:
        print(e)
        raise Exception("処理に失敗しました。入力データを確認するか、サポートにお問い合わせください。")


def convert_address(address):
    if isinstance(address, str):
        address = re.sub(r"(\d+)丁目", r"\1-", address)
        address = re.sub(r"(\d+)番地(\d+号?)", r"\1-\2", address)
        address = re.sub(r"(\d+)番地$", r"\1", address)
        address = re.sub(r'-$', '', address)
    return address


def replace_single_katakana(text):
    single_no_pattern = r'(?<![ｦ-ﾟ])ﾉ(?![ｦ-ﾟ])|(?<![ァ-ン])ノ(?![ァ-ン])'
    single_ke_pattern = r'(?<![ｦ-ﾟ])ｹ(?![ｦ-ﾟ])|(?<![ァ-ン])ケ(?![ァ-ン])'
    single_tsu_pattern = r'(?<![ｦ-ﾟ])ﾂ(?![ｦ-ﾟ])|(?<![ァ-ン])ツ(?![ァ-ン])'
    if isinstance(text, str):
        text = re.sub(single_no_pattern, "の", text)
        text = re.sub(single_ke_pattern, "が", text)
        text = re.sub(single_tsu_pattern, "つ", text)
    return text


def convert_halfwidth_to_fullwidth(text):
    half_to_full_katakana_map = str.maketrans(
        "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝﾞﾟ",
        "ヲァィゥェォャュョッーアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン゛゜"
    )
    if pd.isna(text):
        return text
    text = text.translate(half_to_full_katakana_map)
    text = re.sub(r'(\w゛)', lambda x: chr(ord(x.group(1)[0]) + 1), text)
    text = re.sub(r'(\w゜)', lambda x: chr(ord(x.group(1)[0]) + 2), text)
    return text


def process_address(address_column: pd.DataFrame):
    address_column = address_column.apply(convert_address)
    address_column = address_column.apply(replace_single_katakana)
    address_column = address_column.apply(convert_halfwidth_to_fullwidth)
    return address_column


def process_datetime_column(datetime_column: pd.Series, datetime_format: str = None) -> pd.Series:
    """
    Process a column of datetime in a DataFrame.

    This function takes a column of datetime in a DataFrame and
    processes it to convert it to a standard datetime format.
    If the format is '%y', it converts it to a year.
    Otherwise, it uses the `convert_date_to_gregorian` function
    to convert the datetime to the Gregorian calendar.

    Parameters
    ----------
    datetime_column : pd.Series
        A column of datetime in a DataFrame to be processed.
    datetime_format : str
        The format of the datetime in the column. If None, the
        default format is '%Y-%m-%d'.

    Returns
    -------
    pd.Series
        The processed column of datetime.
    """
    if datetime_format is None:
        datetime_format = '%Y-%m-%d'

    if datetime_format.lower() == '%y':
        datetime_column = datetime_column.apply(convert_to_year)
    else:
        datetime_column = datetime_column.apply(lambda x: convert_date_to_gregorian(x, datetime_format))

    return datetime_column


def process_outliers(df: pd.DataFrame, column_name: str) -> pd.DataFrame:
    """Process a column of a DataFrame for outliers.

    Detect outliers in a column of a DataFrame using the detect_outliers
    function and set them to NaN.

    Parameters
    ----------
    df : pd.DataFrame
        A DataFrame to be processed.
    column_name : str
        Name of the column to be processed.

    Returns
    -------
    pd.DataFrame
        Output DataFrame with outliers set to NaN.
    """
    outliers = detect_outliers(df, column_name)["outliers"]
    df.loc[outliers, column_name] = pd.NA
    return df


def process_data_cleansing(df, request):
    try:
        cleansing = request["cleansing"]
        for op in cleansing:
            if op.get("type", None) == "normalize":
                field = op.get("field", None)
                if field in df.columns:
                    data_type = op.get("dataType", None)
                    if data_type == "address":
                        df[field] = process_address(df[field])
                    if data_type == "datetime":
                        datetime_format = op.get("datetimeFormat", None)
                        print('PROCESS DATETIME', datetime_format, df[field])
                        df[field] = process_datetime_column(df[field], datetime_format)
                    if data_type == "unitnum":
                        df[field] = pd.to_numeric(df[field], errors="coerce")
                        df = process_outliers(df, field)
                else:
                    print(f"Field '{field}' does not exist in DataFrame.")
            elif op.get("type", None) == "replace":
                if op.get("field", None) in df.columns:
                    pattern = re.escape(op.get("target", None))
                    df[op["field"]] = df[op.get("field", None)].replace(pattern, op.get("replace", None), regex=True)
                else:
                    print(f"Field {op.get("field", '')} does not exist in DataFrame.")

    except BaseException as e:
        print(f"Error: {e}")
        raise Exception(e)


def get_extension_file(url):
    try:
        # Download file
        headers = None
        if CMS_GET_ASSETS_TOKEN:
            headers = {"Authorization": f"Bearer {CMS_GET_ASSETS_TOKEN}"}
        data = requests.get(url, stream=True, headers=headers)
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            for chunk in data.iter_content(chunk_size=8192):
                if chunk:
                    temp_file.write(chunk)

            output_file = temp_file.name
        ext_file = get_extention_file_from_url(url)
        if ext_file["status"]:
            return ext_file["ext"], output_file
        else:
            validator = magic.Magic(uncompress=True, mime=True)
            file_type = validator.from_file(output_file)
            extension = mimetypes.guess_extension(file_type, strict=True).replace('.', '')

            if extension and extension != 'txt' or extension == None:
                return extension, output_file
            else:
                is_csv = is_csv_file(output_file)
                if is_csv["status"]:
                    return is_csv["ext"], output_file

                file = open(output_file, "r", encoding="utf8", errors="ignore")
                data = file.read()
                is_json = is_json_file(data)
                if is_json["status"]:
                    file.close()
                    return is_json["ext"], output_file

                file.close()
                return 'txt', output_file
    except BaseException as e:
        print(e)
        return 'txt', None


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


def get_input_data(request):
    try:
        url = request["input"]
        headers = None
        if CMS_GET_ASSETS_TOKEN:
            headers = {"Authorization": f"Bearer {CMS_GET_ASSETS_TOKEN}"}
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        bytesIo = BytesIO(response.content)
        type_file = request.get("inputType")
        match type_file:
            case "json":
                data = json.load(bytesIo)
            case "geojson":
                data = json.load(bytesIo)
            case "csv":
                data = process_csv(bytesIo)
            case "shapefile":
                try:
                    data = process_shp(url)
                except Exception as e:
                    raise DataSourceError(e)

        if isinstance(data, str):
            data = custom_json_decoder.decode(data)

        return data, type_file
    except DataSourceError as e:
        print(e)
        raise Exception(e)
    except BaseException as e:
        print(e)
        raise Exception(e)


def process_shp(url):
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            response = requests.get(url, stream=True)
            response.raise_for_status()
            if response.status_code == 200:
                file_path = f"{temp_dir + os.sep + str(time.time() * 1000)}.zip"
                with open(file_path, "wb") as f:
                    for chunk in response.iter_content(chunk_size=1024):
                        if chunk:
                            f.write(chunk)
                with zipfile.ZipFile(file_path, 'r') as zip_ref:
                    zip_ref.extractall(temp_dir)

                def find_shp_file_in_root(directory):
                    for file in os.listdir(directory):
                        if file.endswith(".shp"):
                            return os.path.join(directory, file)
                    return None

                def find_shp_file_in_subfolders(directory):
                    for root, dirs, files in os.walk(directory):
                        for file in files:
                            if file.endswith(".shp"):
                                return os.path.join(root, file)
                    return None

                shp_file = find_shp_file_in_root(temp_dir)
                if not shp_file:
                    shp_file = find_shp_file_in_subfolders(temp_dir)
                if shp_file:
                    gdf = gpd.read_file(shp_file)
                    geojson_str = gdf.to_json()
                    return geojson_str
                else:
                    raise Exception("シェイプファイルが見つかりません。")
            else:
                raise Exception("SHPファイルの取得中にエラーが発生しました。")
    except BaseException as e:
        print(e)
        raise Exception(
            "シェイプファイルのセットが不完全です。SHP、SHX、DBF、PRJファイルがすべて必要です。シェイプファイルセットを確認し、全ての必須ファイルをアップロードしてください。")


def append_document_name(data, document_name, to_geojson_file=True):
    try:
        if isinstance(data, dict):
            if to_geojson_file:
                features = data['features']
                properties = [feature['properties'] for feature in features]
                geometries = [shape(feature['geometry']) if feature['geometry'] is not None else None for feature in
                              features]
                gdf = gpd.GeoDataFrame(properties, geometry=geometries)
                gdf = gdf[gdf.geometry.notna()]
                gdf['_document_name'] = document_name
                data_str = gdf.to_json()
                data_json = custom_json_decoder.decode(data_str)
                return data_json
            else:
                for key, value in data.items():
                    data[key]['_document_name'] = document_name
                return data
        elif isinstance(data, list):
            for d in data:
                d['_document_name'] = document_name
            return data
    except BaseException as e:
        print(e)
        raise Exception(e)


def detect_encoding(file_bytes: BytesIO) -> str:
    encodings = ['utf-8', 'cp932', 'shift_jis']
    for encoding in encodings:
        try:
            file_bytes.seek(0)
            file_bytes.read().decode(encoding)
            return encoding
        except UnicodeDecodeError:
            continue
    raise ValueError("エンコーディングを検出できません。UTF-8、CP932、Shift-JIS のみ対応しています。")


def process_csv(bytesIo):
    try:
        encoding = detect_encoding(bytesIo)
        bytesIo.seek(0)
        df = pd.read_csv(bytesIo, encoding=encoding)
        output = df.to_json(orient='records', force_ascii=False)
        output = output.replace("\\/", "/")
        return output
    except Exception as e:
        raise Exception(e)


def replace_none_with_null(d):
    if isinstance(d, dict):
        return {k: replace_none_with_null(v) for k, v in d.items()}
    elif isinstance(d, list):
        return [replace_none_with_null(v) for v in d]
    elif d is None:
        return "null"
    else:
        return d


def cleansing_function(request, data, type_file):
    try:
        if isinstance(data, str):
            data = custom_json_decoder.decode(data)
        match type_file:
            case "json":
                df = pd.DataFrame(data)
                process_data_cleansing(df, request)
                json_data = df.to_json(orient='records', force_ascii=False)
                json_data = json_data.replace("\\/", "/")
                return json_data
            case "csv":
                df = pd.DataFrame(data)
                process_data_cleansing(df, request)
                json_data = df.to_json(orient='records', force_ascii=False)
                json_data = json_data.replace("\\/", "/")
                return json_data
            case "geojson":
                gdf = gpd.GeoDataFrame.from_features(data["features"])
                process_data_cleansing(gdf, request)
                features = gdf.to_json()
                features = features.replace("\\/", "/")
                features_json = custom_json_decoder.decode(features)
                geojson_data = {
                    "type": "FeatureCollection",
                    "features": features_json["features"],
                    "crs": data["crs"] if "crs" in data else ""
                }
                return json.dumps(geojson_data, ensure_ascii=False, sort_keys=False)
    except BaseException as e:
        print(f"Cleansing error {e}")
        raise Exception(e)


def geocoding_function(request, data, type_file):
    try:
        target_column = request["geocoding"]["fields"]
        to_geojson_file = request.get("geocoding", {}).get("toGeojson", True)
        if isinstance(data, str):
            data = custom_json_decoder.decode(data)

        if type_file == "geojson":
            data = replace_none_with_null(data)
            if isinstance(data, dict):
                geojson_file = StringIO(json.dumps(data))
            else:
                geojson_file = StringIO(data)

            dataframe = gpd.read_file(geojson_file)
        else:
            dataframe = pd.DataFrame(data)

        output = asyncio.run(add_lat_lng(dataframe, type_file, target_column, to_geojson_file))
        data = json.dumps(output, ensure_ascii=False, sort_keys=False, indent=4)
        return data

    except BaseException as e:
        print(e)
        raise Exception(e)


def crs_normalise_function(data):
    try:
        if isinstance(data, str):
            data = custom_json_decoder.decode(data)
        gdf = convert_crs(data)
        response = gdf.to_json()
        return response

    except BaseException as e:
        print(f"Error function crs_normalise_function: {e}")
        raise Exception(e)


def convert_address(address):
    if isinstance(address, str):
        address = re.sub(r"(\d+)丁目", r"\1-", address)
        address = re.sub(r"(\d+)番地(\d+号?)", r"\1-\2", address)
        address = re.sub(r"(\d+)番地$", r"\1", address)
        address = re.sub(r'-$', '', address)
    return address


def replace_single_katakana(text):
    single_no_pattern = r'(?<![ｦ-ﾟ])ﾉ(?![ｦ-ﾟ])|(?<![ァ-ン])ノ(?![ァ-ン])'
    single_ke_pattern = r'(?<![ｦ-ﾟ])ｹ(?![ｦ-ﾟ])|(?<![ァ-ン])ケ(?![ァ-ン])'
    single_tsu_pattern = r'(?<![ｦ-ﾟ])ﾂ(?![ｦ-ﾟ])|(?<![ァ-ン])ツ(?![ァ-ン])'
    if isinstance(text, str):
        text = re.sub(single_no_pattern, "の", text)
        text = re.sub(single_ke_pattern, "が", text)
        text = re.sub(single_tsu_pattern, "つ", text)
    return text


def convert_halfwidth_to_fullwidth(text):
    half_to_full_katakana_map = str.maketrans(
        "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝﾞﾟ",
        "ヲァィゥェォャュョッーアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン゛゜"
    )
    if pd.isna(text):
        return text
    text = text.translate(half_to_full_katakana_map)
    text = re.sub(r'(\w゛)', lambda x: chr(ord(x.group(1)[0]) + 1), text)
    text = re.sub(r'(\w゜)', lambda x: chr(ord(x.group(1)[0]) + 2), text)
    return text


def insert_conditional_column(df, lat_column_name, lng_column_name, longitude, latitude, file_extension, row_index,
                              output_dict,
                              to_geojson_file):
    df.loc[row_index, lat_column_name] = latitude
    df.loc[row_index, lng_column_name] = longitude
    if file_extension == "geojson":
        df.loc[row_index, 'geometry'] = Point(longitude, latitude)
    if to_geojson_file:
        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [longitude, latitude]
            },
            "properties": df.loc[row_index].to_dict()
        }
        output_dict["features"].append(feature)


def prepare_output_format(file_extension, to_geojson_file):
    output_format = {}
    if file_extension != "geojson" and to_geojson_file:
        output_format = {
            "type": "FeatureCollection",
            "features": [],
            "crs": {
                "type": "name",
                "properties": {
                    "name": "urn:ogc:def:crs:EPSG::4326"
                }
            }
        }

    return output_format


async def add_lat_lng(df, file_extension: str, target_column: list, to_geojson_file: bool = True) -> list:
    print("GEOCODING: Start add lat lng")
    try:
        df = df.map(lambda x: x.replace('\n', '').replace('\r', '') if isinstance(x, str) else x)

        output = prepare_output_format(file_extension, to_geojson_file)

        target_column_index = df.columns.get_loc(target_column[-1])
        lat_column_name = f'{target_column[-1]}{LATITUDE_POSTFIX}'
        lng_column_name = f'{target_column[-1]}{LONGITUDE_POSTFIX}'
        df.insert(target_column_index + 1, lng_column_name, None)
        df.insert(target_column_index + 2, lat_column_name, None)

        address = []
        for index, row in df.iterrows():
            full_address = ""
            for address_col in target_column:
                full_address += row[address_col]
                if full_address:
                    address.append({
                        index: full_address
                    })
                else:
                    print('[ADD LAT LNG] No address found', index, row)
                    insert_conditional_column(df, lat_column_name, lng_column_name, 0, 0, file_extension, index, output,
                                              to_geojson_file)

        list_address = [address[i:i + 20] for i in range(0, len(address), 20)]
        for chunk in list_address:
            task = [get_lat_lng(row) for row in chunk]
            results = await asyncio.gather(*task)
            await asyncio.sleep(5)
            for result in results:
                row_index, longitude, latitude = result
                insert_conditional_column(df, lat_column_name, lng_column_name, longitude, latitude, file_extension,
                                          row_index,
                                          output, to_geojson_file)

        if file_extension == "geojson" or not to_geojson_file:
            output = custom_json_decoder.decode(df.to_json(orient='records', force_ascii=False))
        return output
    except Exception as e:
        print(f"Error function add_lat_lng: {e}")
        raise


async def get_lat_lng(full_address: dict) -> Tuple[int, float, float]:
    """Get latitude and longitude from address using AWS Location Service."""
    async with semaphore:
        row_index, address = None, None
        longitude, latitude = 0, 0
        try:
            for key, value in full_address.items():
                address = value
                row_index = key

            url = f"{AWS_LOCATION_SERVICE_API_ENDPOINT}{AWS_LOCATION_SERVICE_API_KEY}"
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json={"Text": address}) as response:
                    if response.status == 200:
                        data = await response.json()
                        result = data.get("Results")
                        if result:
                            longitude, latitude = result[0]["Place"]["Geometry"]["Point"]
                        else:
                            print('[GET LAT LNG] Cannot get lat lng from AWS', address)
            return row_index, longitude, latitude
        except aiohttp.ClientError as e:
            print(f"Error getting location for {address}: {e}")
            return row_index, longitude, latitude


def remove_z_coordinate(geometry):
    # ポリゴンの場合
    if geometry.geom_type == 'Polygon':
        # 外部リングの座標からZ座標を除去し、新しいポリゴンを作成
        return Polygon([(x, y) for x, y, *_ in geometry.exterior.coords])
    # マルチポリゴンの場合
    elif geometry.geom_type == 'MultiPolygon':
        new_polygons = []
        # 各ポリゴンに対してZ座標を除去
        for poly in geometry.geoms:
            new_polygons.append(Polygon([(x, y) for x, y, *_ in poly.exterior.coords]))
        # 新しいマルチポリゴンを作成
        return MultiPolygon(new_polygons)
    # その他のジオメトリタイプの場合は変更せずに返す
    else:
        return geometry


def convert_crs(data) -> gpd.GeoDataFrame:
    try:
        crs_info = None
        crs_metadata = data.get('crs')
        if crs_metadata:
            crs_info = crs_metadata.get('properties', {}).get('name', None)
        features = data['features']

        properties = [feature['properties'] for feature in features]
        geometries = [shape(feature['geometry']) if feature['geometry'] is not None else None for feature in
                      features]
        gdf = gpd.GeoDataFrame(properties, geometry=geometries)
        gdf = gdf[gdf.geometry.notna()]

        if crs_info:
            gdf.set_crs(crs_info, inplace=True)

        if 'geometry' not in gdf.columns:
            print("'geometry' column is missing in the input data")
        else:
            gdf['geometry'] = gdf['geometry'].apply(
                lambda wkt_str: wkt.loads(wkt_str) if isinstance(wkt_str, str) else wkt_str)

            gdf['geometry'] = gdf['geometry'].apply(remove_z_coordinate)

        if gdf.crs is None:
            gdf.set_crs(epsg=4326, inplace=True)
        gdf_wgs84 = gdf.to_crs(epsg=4326)
        return gdf_wgs84
    except BaseException as e:
        print(f"Error function convert_crs: {e}")


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


def call_api_endpoint(data, properties, ticketId, apiEndpoint):
    try:
        request = OrderedDict(
            {
                "ticketId": ticketId,
                "schema": {
                    "type": "object",
                    "properties": properties
                },
                "data": data
            }
        )
        print("request", request)
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
                    "name": key if key != "_document_name" else value,
                    "type": detect_type(value)
                }

    except BaseException as e:
        print(f"Error function generate properties {e}")

    return properties


# Define main script
def main():
    print(f"Starting Task #{TASK_INDEX}, Attempt #{TASK_ATTEMPT}...")
    print("container updated")
    if DMS_DATA:
        print("[DMS_DATA]", DMS_DATA)
        cleansing_data(DMS_DATA)
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
