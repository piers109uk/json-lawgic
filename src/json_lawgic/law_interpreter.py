from data_readers import read_json, read_text
from dotenv import load_dotenv
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field
from typing import cast
from pprint import pprint


# Load environment variables from .env file
load_dotenv()

llm = ChatOpenAI(model="gpt-4o", temperature=0)


# Pydantic
class JsonLogicInterpretation(BaseModel):
    """A JSON logic interpretation."""

    rule: object = Field(
        description="The pure JSON logic rule expressed as a JSON object"
    )
    examples: list[object] = Field(
        description="Three examples of data that we could run the JsonLogic rule on"
    )
    variables: list[str] = Field(
        description="A list of variables referenced in the rule"
    )

    # TODO:
    # Compliance, Obligation, Permission, Prohibition, Right, SuborderList, Violation
    # https://docs.oasis-open.org/legalruleml/legalruleml-core-spec/v1.0/os/legalruleml-core-spec-v1.0-os.html#_Toc38017883


prompt_str = """
I am looking to express laws as JsonLogic.

Here is some info on how JSON logic works:
---
{json_logic}
---

Please express the following law as JSON logic:
{law}

Provide your response as JSON in the following form:
// The pure JSON logic rule expressed as a JSON object
rule: object
// three examples of data that we could run the JsonLogic rule on
examples: object[]
// a list of variables referenced in the rule
variables: string[]

"""

prompt_template = PromptTemplate.from_template(prompt_str)


class LawInterpreter:
    json_logic = read_text("markdown/json-logic.md")

    def interpret_law(self, law_object: dict) -> dict:
        law_text = law_object.get("text")
        prompt = prompt_template.invoke(
            {"json_logic": self.json_logic, "law": law_text}
        )
        structured_llm = llm.with_structured_output(JsonLogicInterpretation)
        response = cast(JsonLogicInterpretation, structured_llm.invoke(prompt))
        res_dict = response.model_dump()
        return res_dict


if __name__ == "__main__":
    interpreter = LawInterpreter()
    law_object = read_json("data/default/000000001.json")
    law_dict = interpreter.interpret_law(law_object)
    pprint(law_dict)
