from typing import Literal

from pydantic import BaseModel, Field


# Doc OCR
class OCRConfig(BaseModel):
    """OCR body.

    Args:
    ----
        loader_type (str): The type of the loader (default: azure)
        source (str): The source of the document (default: url)
        file_path (str): The path to the file
        url_path (str): The URL to the

        # AzureDocumentLoaderConfig
        api_model (str): Unique document model name (default: prebuilt-layout)
        mode (str): The type of content representation of the generated Documents (default: markdown)

    """  # noqa: E501

    loader_type: str = Field(default="azure", title="The type of the loader")

    # AzureDocumentLoaderConfig
    api_model: str = Field(
        default="prebuilt-layout", title="Unique document model name"
    )
    mode: str = Field(
        default="markdown",
        title="The type of content representation of the generated Documents",
    )


class DocOCRConfig(OCRConfig):
    """OCR body.

    Args:
    ----
        source (str): The source of the document (default: url)
        url_path (str): The URL to the

    """

    source: str = Field(default="url", title="The source of the document")
    url_path: str | None = Field(default=None, title="The URL to the file")


# define the request body
class RequestBody(BaseModel):
    """Request body for the POST request.

    Args:
    ----
        content (str): The content of the request

    """

    input_type: Literal["content", "url"] = "content"
    schema_mode: Literal["strict", "loose"] = "strict"
    json_schema: dict = {}
    content: str = ""
    file_url: str = ""
    ocr_config: OCRConfig = OCRConfig()
    format_instructions: str = ""
    additional_prompt: str = ""
    bedrock_model_id: str = "anthropic.claude-3-haiku-20240307-v1:0"
    ensemble: bool = True


class RequestBodyModeStrict(BaseModel):
    json_schema: dict
    content: str
    file_url: str
    ocr_config: OCRConfig = OCRConfig()
    additional_prompt: str = ""
    input_type: str = "url"
    schema_mode: str = "strict"
    bedrock_model_id: str = "anthropic.claude-3-haiku-20240307-v1:0"
    ensemble: bool = True


class RequestBodyModeLoose(BaseModel):
    content: str
    format_instructions: str
    input_type: str = "content"
    schema_mode: str = "loose"
    ocr_config: OCRConfig = OCRConfig()
    additional_prompt: str = ""
    bedrock_model_id: str = "anthropic.claude-3-haiku-20240307-v1:0"
    ensemble: bool = True


# define the response body
class ResponseBody(BaseModel):
    """Response body for the POST request.

    Args:
    ----
        message (str): The message to return

    """

    obj: dict
    confidence: dict | None = None


class ColumnSugestion(BaseModel):
    columns: list[str] = Field(default_factory=list, description="list of suggestion column name")
    descriptions: list[str] = Field(default_factory=list, description="list of description for column")