# external imports
import json
import mimetypes
import os
from typing import get_args

import aiofiles
import magic
import pandas as pd
import httpx

# internal imports
from lib.ocr_constants import FILE_EXTENSIONS, SOURCE_TYPES
CMS_GET_ASSETS_TOKEN = os.getenv("CMS_GET_ASSETS_TOKEN", "")

def confirm_request(extension:str):
    return extension in get_args(FILE_EXTENSIONS)


async def download_file(url, headers = None, suffix: str = None):
    async with httpx.AsyncClient() as client:
        async with client.stream("GET", url, headers=headers) as response:
            response.raise_for_status()
            async with aiofiles.tempfile.NamedTemporaryFile('wb', delete=False, suffix=suffix) as temp_file:
                async for chunk in response.aiter_bytes(8192):
                    await temp_file.write(chunk)
                output_file = temp_file.name
    return output_file

async def get_extension_file(url):
    try:
        headers = None
        if CMS_GET_ASSETS_TOKEN:
            headers = {"Authorization": f"Bearer {CMS_GET_ASSETS_TOKEN}"}
        output_file = await download_file(url=url, headers=headers)
        ext_file = get_extention_file_from_url(url)
        if ext_file["status"]:
            return ext_file["ext"], output_file
        else:
            # Download file
            validator = magic.Magic(uncompress=True, mime=True)
            file_type = validator.from_file(output_file)
            extension = mimetypes.guess_extension(file_type, strict=True).replace('.', '')

            if extension and extension != 'txt' or extension == None:
                return extension, output_file
            else:
                is_csv = is_csv_file(output_file)
                if is_csv["status"]:
                    return is_csv["ext"], output_file
                async with aiofiles.open(output_file, mode='r', encoding='utf8', errors='ignore') as file:
                    data = await file.read()

                is_json = is_json_file(data)
                if is_json["status"]:
                    return is_json["ext"], output_file
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
