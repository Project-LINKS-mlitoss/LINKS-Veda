# external imports
from typing import Any

import boto3
from botocore.client import BaseClient
from langchain_aws import ChatBedrock
from langchain_core.exceptions import OutputParserException
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.outputs import Generation
from langchain_core.prompts import PromptTemplate  # noqa: TCH002
from langchain_core.utils.json import parse_json_markdown
from pydantic import Extra
import os

AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID', '')
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY', '')

# LLM Chat
class LLMChat(ChatBedrock):
    """LLMChat class.

    This class is used to interact with the LLM model.
    """

    class Config:
        """Configuration for this pydantic object."""

        extra = Extra.allow

    def __init__(
            self: "LLMChat",
            model_id: str,
    ) -> None:
        """__init__.

        Args :
            model_id (str): model_id
        """
        client = self.__load_client()
        super().__init__(
            model_id=model_id,
            client=client,
            model_kwargs={"temperature": 0, "max_tokens": 8192},
        )
        self.prompt: PromptTemplate | None = None

    @classmethod
    def __load_client(cls: "LLMChat") -> BaseClient:
        """load_client.

        Returns :
            BaseClient: BaseClient
        """
        return boto3.client(
            "bedrock-runtime",
            region_name="us-west-2",
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )


from json import JSONDecodeError
class CustomJsonOutputParser(JsonOutputParser):
    def parse_result(self, result: list[Generation], *, partial: bool = False) -> Any:
        """Parse the result of an LLM call to a JSON object.

        Args:
            result: The result of the LLM call.
            partial: Whether to parse partial JSON objects.
                If True, the output will be a JSON object containing
                all the keys that have been returned so far.
                If False, the output will be the full JSON object.
                Default is False.

        Returns:
            The parsed JSON object.

        Raises:
            OutputParserException: If the output is not valid JSON.
        """
        text = result[0].text
        text = text.strip()
        print("LLM OUTPUT: ", text)
        json_end = text.rfind("}")
        text = "{" + text[:json_end + 1]
        if partial:
            try:
                return parse_json_markdown(text)
            except JSONDecodeError:
                return None
        else:
            try:
                return parse_json_markdown(text)
            except JSONDecodeError as e:
                msg = f"Invalid json output: {text}"
                raise OutputParserException(msg, llm_output=text) from e

    def parse(self, text: str) -> Any:
        return self.parse_result([Generation(text=text)])
