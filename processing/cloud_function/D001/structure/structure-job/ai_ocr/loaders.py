# external imports
from langchain_community.document_loaders import AzureAIDocumentIntelligenceLoader
from langchain_community.document_loaders.base import BaseLoader
from langchain_core.documents import Document
from pydantic import BaseModel, Field


# Loader Configuration
class DocumentLoaderConfig(BaseModel):
    """A class to configure the document loader.

    Args :
    ----
        loader_type (str): The type of the loader (default: azure)
        file_type (str): The type of the file
        source (str): The source of the document (default: url)
        file_path (str): The path to the file
        url_path (str): The URL to the file
    """

    loader_type: str = Field(default="azure", title="The type of the loader")
    file_type: str = Field(default="pdf", title="The type of the file")
    source: str = Field(default="url", title="The source of the document")
    file_path: str | None = Field(default=None, title="The path to the file")
    url_path: str | None = Field(default=None, title="The URL to the file")


class AzureDocumentLoaderConfig(DocumentLoaderConfig):
    """A class to configure the Azure document loader.

    Args :
    ----
        loader_type (str): The type of the loader (default: azure)
        file_type (str): The type of the file
        source (str): The source of the document (default: url)
        subscription_key (str): The subscription key for the Azure service
        endpoint (str): The endpoint for the Azure service
        api_model (str): Unique document model name (default: prebuilt-layout)
        mode (str): The type of content representation of the generated Documents (default: markdown)
    """  # noqa: E501

    endpoint: str | None = Field(
        default=None,
        title="The endpoint for the Azure service",
    )
    subscription_key: str | None = Field(
        default=None,
        title="The subscription key for the Azure service",
    )
    api_model: str = Field(
        default="prebuilt-layout", title="Unique document model name"
    )
    mode: str = Field(
        default="markdown",
        title="The type of content representation of the generated Documents",
    )


# Loader class
class AnyDocumentLoader:
    """A class to load any document from any source.

    Args :
    ----
        config (DocumentLoaderConfig): The configuration for the document loader
    """

    def __init__(self: "AnyDocumentLoader", config: DocumentLoaderConfig) -> None:
        """Initialize the object with the configuration.

        Args :
        -----
            config (DocumentLoaderConfig): The configuration for the document loader
        """
        self.config = config
        self.loader = self.__get_loader(config)

    def __get_loader(
        self: "AnyDocumentLoader",
        config: AzureDocumentLoaderConfig | DocumentLoaderConfig,
    ) -> AzureAIDocumentIntelligenceLoader | BaseLoader:
        """Set the loader based on the loader type.

        Args :
        -----
            config (AzureDocumentLoaderConfig | DocumentLoaderConfig):
                The configuration for the loader

        Returns :
        --------
            AzureAIDocumentIntelligenceLoader | BaseLoader:
                The loader object
        """
        if config.loader_type == "azure":
            return AzureAIDocumentIntelligenceLoader(
                api_endpoint=config.endpoint,
                api_key=config.subscription_key,
                file_path=config.file_path,
                url_path=config.url_path,
                api_model=config.api_model,
                mode=config.mode,
            )
        not_implemented_error = "The loader type is not implemented"
        raise NotImplementedError(not_implemented_error)

    def load(self: "AnyDocumentLoader") -> list[Document]:
        """Load the document based on the configuration.

        Returns :
        --------
            list[Document]: The list of documents
        """
        return self.loader.load()

    async def async_load(self: "AnyDocumentLoader") -> list[Document]:
        return await self.loader.aload()