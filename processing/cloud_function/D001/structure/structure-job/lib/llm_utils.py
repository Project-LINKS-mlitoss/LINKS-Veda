# external imports
import asyncio
from http.client import HTTPException
from botocore.exceptions import ClientError

from lib.llm_types import DocOCRConfig
from nlp.utils import cluster_texts
from nlp.extraction import (
    aextract_json_with_schema,
    extract_json_with_schema,
    extract_json_with_schema_with_instructions,
)


def construct_doc_ocr_config(request_body):
    return DocOCRConfig(
        source="url",
        url_path=request_body.get("file_url"),
    )


async def aextract_from_doc_ocr(request_body):
    try:
        return await aextract_from_content(request_body)
    except ClientError as e:
        raise e
    except HTTPException as e:
        print("Error function aextract_from_doc_ocr:", e)
        raise HTTPException(e)
    except Exception as e:
        print("Error function aextract_from_doc_ocr:", e)
        raise Exception(e)


def calculate_confidence(
        objs: list[dict],
        min_length: int = 3,
        keys: list[str] = None,
) -> tuple[dict, dict]:
    # keys = list(objs[0].keys())
    confidence = {}
    true_obj = {}
    for key in keys:
        values = [None if isinstance(obj.get(key), (dict, list)) else obj.get(key) for obj in objs]
        _values = [str(value or '') for value in values]
        string_min_length = min([len(value) for value in _values])
        clusters = cluster_texts(
            _values,
            min_length=min_length
            if string_min_length > min_length
            else string_min_length,
        )
        confidence[key] = round(sum(clusters) / len(clusters), 2)
        try:
            true_index = clusters.index(1)
            true_obj[key] = values[true_index]
        except:
            true_obj[key] = values[0]

    return true_obj, confidence


def split_content(content, delimiter="<!-- PageBreak -->", max_length=20000):
    # Split the original content based on the delimiter.
    parts = content.split(delimiter)
    result = []
    current_part = ""

    for part in parts:
        # If adding a new part to current_part does not exceed max_length.
        if len(current_part) + len(part) + len(delimiter) <= max_length:
            if current_part:
                current_part += delimiter
            current_part += part
        else:
            # If current_part is full, save it to the result and start a new part.
            result.append(current_part)
            current_part = part

    # Add the remaining part to the result.
    if current_part:
        result.append(current_part)

    return result


async def aextract_from_content(request_body):
    try:
        if request_body.get("schema_mode") == "strict":
            if request_body.get("ensemble"):
                prompt_types = [
                    "default",
                    "table",
                    "key_value",
                ]

                if request_body.get("type_output", "object") == "object":
                    objs = await asyncio.gather(*[
                        aextract_json_with_schema(
                            bedrock_model_id=request_body.get("bedrock_model_id"),
                            json_schema=request_body.get("json_schema"),
                            additional_prompt=request_body.get("additional_prompt"),
                            content=request_body.get("content"),
                            prompt_type=prompt_type,
                            pydantic_model=request_body.get("pydantic_model"),
                        )
                        for prompt_type in prompt_types])
                    obj, confidence = calculate_confidence(objs, min_length=10, keys=request_body['keys'])
                    # obj = await aextract_json_with_schema(
                    #     bedrock_model_id=request_body.get("bedrock_model_id"),
                    #     json_schema=request_body.get("json_schema"),
                    #     additional_prompt=request_body.get("additional_prompt"),
                    #     content=request_body.get("content"),
                    #     prompt_type="default",
                    #     pydantic_model=request_body.get("pydantic_model"),
                    # )
                    return {"obj": obj, "confidence": confidence}
                else:
                    page_contents = split_content(request_body.get("content"))
                    objs = []
                    for i in range(0, len(page_contents), 5):
                        chunk = page_contents[i: i + 5]
                        chunk_result = await asyncio.gather(*[
                            aextract_json_with_schema(
                                bedrock_model_id=request_body.get("bedrock_model_id"),
                                json_schema=request_body.get("json_schema"),
                                additional_prompt=request_body.get("additional_prompt"),
                                content=page_content,
                                prompt_type="table",
                                pydantic_model=request_body.get("pydantic_model"),
                            )
                            for page_content in chunk
                        ])
                        objs.extend(chunk_result)
                        await asyncio.sleep(10)

                    result = []
                    for obj in objs:
                        result.extend(obj.get("llm_response_array", []))
                    return {"obj": result, "confidence": {}}
            # obj, confidence = calculate_confidence(objs, min_length=10)

            obj = extract_json_with_schema(
                bedrock_model_id=request_body.get("bedrock_model_id"),
                json_schema=request_body.get("json_schema"),
                additional_prompt=request_body.get("additional_prompt"),
                content=request_body.get("content"),
            )
            return {"obj": obj}

        obj = extract_json_with_schema_with_instructions(
            bedrock_model_id=request_body.get("bedrock_model_id"),
            format_instructions=request_body.get("format_instructions"),
            content=request_body.get("content"),
        )
        return {"obj": obj}

    except ClientError as e:
        print(f'[LLM utils] ClientError: {e}')
        raise e
    except KeyError as e:
        print(e)
        raise KeyError(e)
    except Exception as e:
        print(e)
        raise Exception(e)
