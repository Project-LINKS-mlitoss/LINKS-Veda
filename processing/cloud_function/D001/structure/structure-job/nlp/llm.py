import os
from typing import Literal, Type

import boto3
from botocore.client import BaseClient
from botocore.config import Config
from langchain_aws import ChatBedrock
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import PromptTemplate
from pydantic import Extra, BaseModel
from nlp.output_parsers import (
    LLMStructuredOutputParser,
    LLMStructuredOutputParserWithInstructions, CustomJsonOutputParser,
)
from lib.llm_types import ColumnSugestion

# internal imports

AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID', "")
AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY', "")


# LLM Chat
class LLMChat(ChatBedrock):
    """LLMChat class.

    Args :
        ChatBedrock (ChatBedrock): ChatBedrock
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
            chain (ConversationChain): chain
        """
        client = self.__load_client()
        super().__init__(
            model_id=model_id,
            client=client,
            model_kwargs={"temperature": 0, "max_tokens": 8192},
            provider="anthropic"
        )

        self.prompt: PromptTemplate | None = None

    @classmethod
    def __load_prompt(
            cls: "LLMChat",
            format_instructions: str,
            additional_prompt: str = "",
            prompt_type: Literal["default", "table", "list", "key_value"] = "default",
    ) -> PromptTemplate:
        """__load_prompt.

        Returns :
            PromptTemplate: PromptTemplate
        """
        scenario_instructions = {
            "table": """
            For tables, pay extra attention to:
            - Identifying all tables in the document.
            - Extracting headers and all data rows accurately.
            - Interpreting merged cells and complex table structures correctly.
            - Preserving relationships between table headers and data.
            """,
            "list": """
            For lists, pay extra attention to:
            - Identifying all types of lists (bulleted, numbered, or otherwise).
            - Capturing the hierarchy and structure of nested lists.
            - Preserving the relationship between list items and any associated descriptions.
            """,  # noqa: E501
            "key_value": """
            For key-value structures, pay extra attention to:
            - Identifying all key-value pairs in various formats (e.g., "Key: Value", "Key = Value", or tabular layouts).
            - Correctly associating multi-line values with their keys.
            - Recognizing implied keys or values based on context.
            """,  # noqa: E501
            "default": """
            Pay equal attention to all types of data structures and information present in the document.
            """,  # noqa: E501
        }

        return PromptTemplate(
            template="""
Extract all relevant information from the given document to fill the response schema.
Pay attention to various data structures including plain text, tables, lists, and key-value pairs.

General guidelines:
1. Thoroughly analyze the entire document to extract all relevant information.
2. Ensure that relationships between different pieces of information are preserved.
3. If information for a field is not found, use null as the default value.
{scenario_specific_instructions}


{format_instructions}
Generate the output as a valid JSON object in a minified format (without spaces or line breaks)


User additional prompt:
{additional_prompt}


Document content:
{question}""",  # noqa: E501
            input_variables=["question"],
            partial_variables={
                "format_instructions": format_instructions,
                "additional_prompt": additional_prompt,
                "scenario_specific_instructions": scenario_instructions[prompt_type],
            },
        )

    @classmethod
    def get_json_mode_prompt_parser(
            cls: "LLMChat",
            schemas: Type[BaseModel],
            additional_prompt: str = "",
            prompt_type: Literal["default", "table", "list", "key_value"] = "default",
    ) -> tuple[PromptTemplate, JsonOutputParser]:
        """get_json_mode_prompt_parser.

        Args :
            schemas (list[ResponseSchema]): schemas

        Returns :
            PromptTemplate: PromptTemplate
            OutputParser: OutputParser
        """
        output_parser = CustomJsonOutputParser(pydantic_object=schemas)
        format_instructions = output_parser.get_format_instructions()
        prompt = cls.__load_prompt(
            format_instructions=format_instructions,
            additional_prompt=additional_prompt,
            prompt_type=prompt_type,
        )
        return prompt, output_parser

    @classmethod
    def get_json_mode_prompt_parser_with_instructions(
            cls: "LLMChat",
            format_instructions: str,
            additional_prompt: str = "",
    ) -> tuple[PromptTemplate, LLMStructuredOutputParser]:
        """get_json_mode_prompt_parser_with_instructions.

        Args :
            format_instructions (str): format_instructions

        Returns :
            PromptTemplate: PromptTemplate
            OutputParser: OutputParser
        """
        output_parser: LLMStructuredOutputParserWithInstructions = (
            LLMStructuredOutputParserWithInstructions.from_format_instructions(
                format_instructions=format_instructions,
            )
        )
        format_instructions = output_parser.get_format_instructions()
        prompt = PromptTemplate(
            template="""
            The output should be a markdown code snippet formatted
            in the following schema,
            including the leading and trailing "```json" and "```":

            ```json
            {{
                "key1": "value1",
                "key2": "value2",
                ...
            }}
            ```
            \n {format_instructions} \n
                \n{additional_prompt}\n{question}""",
            input_variables=["question"],
            partial_variables={
                "format_instructions": format_instructions,
                "additional_prompt": additional_prompt,
            },
        )
        return prompt, output_parser

    @classmethod
    def __load_client(cls: "LLMChat") -> BaseClient:
        """load_client.

        Returns :
            BaseClient: BaseClient
        """
        config = Config(read_timeout=600)

        return boto3.client(
            "bedrock-runtime",
            region_name="ap-northeast-1",
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            config=config,
        )

    @classmethod
    def get_prompt_parser_data_column_suggestion(cls):
        column_suggestion_prompt = """
You provided the output of "{column}" field that may wrong result in document bellow, maybe my prompt column "{column}" is wrong.
- You must base on old name {column} and document context for refer to generate new better column name and description for column

- The context extract:
{content}

The old column name I provided is:
{column}

The old description of that column I provided is:
{description}

The value of old column that you answer before is:
{column_value}

- Output must be in JSON Object as format instructions, and not include any other information
Format instructions
{format_instructions}
"""
        parser = JsonOutputParser(pydantic_object=ColumnSugestion)
        prompt = PromptTemplate(
            template=column_suggestion_prompt,
            input_variables=["content", "column", "description", "column_value"],
            partial_variables={
                "format_instructions": parser.get_format_instructions(),
            }
        )

        return prompt, parser
