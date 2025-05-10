# external imports
import os
import sys
import tempfile

import requests
from langchain_core.documents import Document
import httpx

from lib.ocr_utils import download_file

# internal imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from ai_ocr.loaders import (
    AnyDocumentLoader,
    AzureDocumentLoaderConfig,
    DocumentLoaderConfig,
)
from lib.ocr_types import RequestBody

DOCUMENT_INTELLIGENCE_ENDPOINT = os.getenv('DOCUMENT_INTELLIGENCE_ENDPOINT', "")
DOCUMENT_INTELLIGENCE_KEY = os.getenv('DOCUMENT_INTELLIGENCE_KEY', "")

async def get_config(
    request_body: RequestBody,
    extension: str
) -> AzureDocumentLoaderConfig | DocumentLoaderConfig:
    """Get the configuration for the document loader.

    Args:
    ----
        request_body (RequestBody): The request body

    Returns:
    -------
        AzureDocumentLoaderConfig | DocumentLoaderConfig:
            The configuration for the document loader

    """

    if request_body.loader_type == "azure":
        return AzureDocumentLoaderConfig(
                file_type=extension,
                source='file',
                file_path=request_body.file_path,
                url_path='',
                api_model=request_body.api_model,
                mode=request_body.mode,
                endpoint=DOCUMENT_INTELLIGENCE_ENDPOINT,
                subscription_key=DOCUMENT_INTELLIGENCE_KEY,
            )
    not_implemented_error = "The loader type is not implemented."
    raise NotImplementedError(not_implemented_error)


def load_documents(
    config: AzureDocumentLoaderConfig | DocumentLoaderConfig,
) -> list[Document]:
    """Load the documents.

    Args:
    ----
        config (AzureDocumentLoaderConfig | DocumentLoaderConfig):
            The configuration for the document loader

    Returns:
    -------
        list[Document]: The list of documents

    """
    loader = AnyDocumentLoader(config)
    return loader.load()

async def aload_documents(
    config: AzureDocumentLoaderConfig | DocumentLoaderConfig,
) -> list[Document]:
    """Load the documents.

    Args:
    ----
        config (AzureDocumentLoaderConfig | DocumentLoaderConfig):
            The configuration for the document loader

    Returns:
    -------
        list[Document]: The list of documents

    """
    loader = AnyDocumentLoader(config)
    return await loader.async_load()