import json
from typing import Any

from langchain.output_parsers import StructuredOutputParser
from langchain_core.exceptions import OutputParserException
from langchain_core.output_parsers import BaseOutputParser
from langchain_core.utils.json import parse_json_markdown


# parse_json_markdown
def parse_and_check_json_markdown(text: str, expected_keys: list[str]) -> dict:
    try:
        print(f"llm response before parsing: {text}")
        json_obj = parse_json_markdown(text)
    except json.JSONDecodeError as e:
        raise OutputParserException(
            error=f"Got invalid JSON object. Error: {e}",
        )
    for key in expected_keys:
        if key not in json_obj:
            json_obj[key] = None
    return json_obj


# parse_json_markdown_without_check
def parse_json_markdown_without_check(text: str) -> dict:
    try:
        print(f"llm response before parsing: {text}")
        return parse_json_markdown(text)
    except json.JSONDecodeError as e:
        raise OutputParserException(
            error=f"Got invalid JSON object. Error: {e}",
        )


# LLMStructuredOutputParser
class LLMStructuredOutputParser(StructuredOutputParser):
    """LLMStructuredOutputParser class.

    Args :
        StructuredOutputParser (StructuredOutputParser): StructuredOutputParser
    """

    def parse(self: "LLMStructuredOutputParser", text: str) -> Any:
        """parse.

        Args :
            output (str): output

        Returns :
            dict: dict
        """

        expected_keys = [rs.name for rs in self.response_schemas]
        return parse_and_check_json_markdown(text, expected_keys)


# StructuredOutputParserWithInstructions
class StructuredOutputParserWithInstructions(BaseOutputParser):
    """StructuredOutputParserWithInstructions class.

    Args :
        BaseOutputParser (BaseOutputParser): BaseOutputParser
    """

    format_instructions: str

    @classmethod
    def from_format_instructions(
        cls: "StructuredOutputParserWithInstructions",
        format_instructions: str,
    ) -> "StructuredOutputParserWithInstructions":
        """from_format_instructions.

        Args :
            format_instructions (str): format_instructions

        Returns :
            StructuredOutputParserWithInstructions:
                StructuredOutputParserWithInstructions
        """
        return cls(format_instructions=format_instructions)

    def get_format_instructions(
        self: "StructuredOutputParserWithInstructions",
    ) -> str:
        """get_format_instructions.

        Returns :
            str: str
        """
        return self.format_instructions

    @property
    def _type(self: "StructuredOutputParserWithInstructions") -> str:
        """_type.

        Returns :
            str: str
        """
        return "structured"


# LLMStructuredOutputParserWithInstructions
class LLMStructuredOutputParserWithInstructions(StructuredOutputParserWithInstructions):
    """LLMStructuredOutputParserWithInstructions class.

    Args :
        StructuredOutputParserWithInstructions (StructuredOutputParserWithInstructions):
            StructuredOutputParserWithInstructions
    """

    def parse(
        self: "LLMStructuredOutputParserWithInstructions",
        text: str,
    ) -> Any:
        """parse.

        Args :
            text (str): text

        Returns :
            Any: Any
        """
        return parse_json_markdown_without_check(text)

from langchain_core.output_parsers import JsonOutputParser
from langchain_core.outputs import Generation
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
        text = "{" + text[:json_end + 1] if not text.startswith("{") else text[:json_end + 1]
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
