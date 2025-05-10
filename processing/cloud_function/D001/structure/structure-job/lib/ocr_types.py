# external imports
from typing import Any

from pydantic import BaseModel, Field


# internal imports
# define the request body
class RequestBody(BaseModel):
    """Request body for the POST request.

    Args:
    ----
        loader_type (str): The type of the loader (default: azure)
        source (str): The source of the document (default
        file_path (str): The path to the file
        url_path (str): The URL to the

        # AzureDocumentLoaderConfig
        api_model (str): Unique document model name (default: prebuilt-layout)
        mode (str): The type of content representation of the generated Documents (default: markdown)

    """  # noqa: E501

    loader_type: str = Field(default="azure", title="The type of the loader")
    source: str = Field(default="url", title="The source of the document")
    file_path: str | None = Field(default=None, title="The path to the file")
    url_path: str | None = Field(default=None, title="The URL to the file")

    # AzureDocumentLoaderConfig
    api_model: str = Field(
        default="prebuilt-layout", title="Unique document model name"
    )
    mode: str = Field(
        default="markdown",
        title="The type of content representation of the generated Documents",
    )


# define the response body
class ResponseBody(BaseModel):
    """Response body for the POST request.

    Args:
    ----
        documents (list[dict[str, Any]]): The list of documents

    """

    documents: list[dict[str, Any]]
    source: str
    path: str
    loader_type: str

class HTTPException(BaseModel):
    status_code: int
    detail: str

