from langchain_aws import ChatBedrock
import boto3
from botocore.client import BaseClient
import os
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID','')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY', '')

class LLMChat(ChatBedrock):
    def __init__(
        self: "LLMChat",
        model_id: str,
    ) -> None:
        """__init__.

        Args :
            chain (ConversationChain): chain
        """
        client = self.__load_client()
        super().__init__(
            model_id=model_id,
            client=client,
            model_kwargs={"temperature": 0, "max_tokens": 8192},
        )


    @classmethod
    def __load_client(cls: "LLMChat") -> BaseClient:
        """load_client.

        Returns :
            BaseClient: BaseClient
        """
        return boto3.client(
            "bedrock-runtime",
            region_name="ap-northeast-1",
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        )


