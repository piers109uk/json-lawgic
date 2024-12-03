from pprint import pprint
from typing import cast

from dotenv import load_dotenv
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from json_lawgic.logger import logger
from pydantic import BaseModel, Field

from json_lawgic.data_io import read_json, read_text, write_json
from json_lawgic.langfuse_setup import langfuse_handler

# Load environment variables from .env file
load_dotenv()

llm = ChatOpenAI(model="gpt-4o", temperature=0)

# TODO: enable representing multiple rules with one law


class RuleVariable(BaseModel):
    """A variable used in the JSON logic rule."""

    name: str = Field(description="The name of the variable referenced in the rule")
    description: str = Field(description="A description of what the variable represents")


class JsonLogicInterpretation(BaseModel):
    """A JSON logic interpretation."""

    rule: object = Field(description="The pure JSON logic rule expressed as a JSON object")
    examples: list[object] = Field(description="Three examples of data that we could run the JsonLogic rule on")
    variables: list[RuleVariable] = Field(description="A list of variables referenced in the rule")
    consequences: list[str] = Field(
        description="The consequences IF the rule evaluates to true, expressed as briefly as possible"
    )

    # TODO:
    # Compliance, Obligation, Permission, Prohibition, Right, SuborderList, Violation
    # https://docs.oasis-open.org/legalruleml/legalruleml-core-spec/v1.0/os/legalruleml-core-spec-v1.0-os.html#_Toc38017883


class JsonLogicRules(BaseModel):
    """A collection of JsonLogic rules."""

    rules: list[JsonLogicInterpretation] = Field(description="A collection of JsonLogic rules")


prompt_str = """
I am looking to express laws as JsonLogic.

Here is some info on how JSON logic works:
---
{json_logic}
---

Please express the following law as one or more JSON logic rules:
{law}

Provide your response as JSON in the following form:
// The pure JSON logic rule expressed as a JSON object
rule: object
// three examples of data that we could run the JsonLogic rule on
examples: object[]
// a list of variables referenced in the rule
variables: RuleVariable[]
// The consequences if the rule evaluates to true, expressed as briefly as possible
consequences: string[]

Where RuleVariable is defined as: 
// The name of the variable referenced in the rule
name: string
// A description of what the variable represents
description: string

"""

prompt_template = PromptTemplate.from_template(prompt_str)


class LawInterpreter:
    json_logic = read_text("markdown/json-logic.md")

    def interpret_law(self, law_object: dict) -> dict:
        law_text = law_object.get("text")
        prompt = prompt_template.invoke({"json_logic": self.json_logic, "law": law_text})
        structured_llm = llm.with_structured_output(JsonLogicRules)

        response = cast(JsonLogicRules, structured_llm.invoke(prompt, config={"callbacks": [langfuse_handler]}))

        res_dict = response.model_dump()
        return {**res_dict}

    # def validate_interpretation(self, interpreted_law: JsonLogicInterpretation) -> list[bool]:
    #     rule, examples = interpreted_law.rule, interpreted_law.examples
    #     print(rule)
    #     print(examples)

    #     example_results = [jsonLogic(rule, x) for x in examples]
    #     return example_results


if __name__ == "__main__":
    interpreter = LawInterpreter()
    # law_object = read_json("data/default/000000001.json")
    law_object = read_json("data/default/000049272.json")

    law_dict = interpreter.interpret_law(law_object)

    write_json("data/tests/000049272.json", law_dict)
    pprint(law_dict)

    #  TODO fix json logic
    # rule = {
    #     "and": [
    #         {"==": [{"var": "jurisdiction_type"}, "concurrent"]},
    #         {"==": [{"var": "entity_type"}, "county"]},
    #         {"==": [{"var": "boundary_extension"}, "across_waters"]},
    #     ]
    # }
    # examples = [
    #     {"jurisdiction_type": "concurrent", "entity_type": "county", "boundary_extension": "across_waters"},
    #     {"jurisdiction_type": "exclusive", "entity_type": "state", "boundary_extension": "across_waters"},
    #     {"jurisdiction_type": "concurrent", "entity_type": "county", "boundary_extension": "land_only"},
    # ]

    # rules = {"and": [{"<": [{"var": "temp"}, 110]}, {"==": [{"var": "pie.filling"}, "apple"]}]}

    # data = {"temp": 100, "pie": {"filling": "apple"}}

    # print(jsonLogic(rules, data))
    # print(jsonLogic(rule, examples[0]))
    # r = [jsonLogic(rule, x) for x in examples]
    # print(r)
    # law_dict = interpreter.interpret_law(law_object)
    # pprint(law_dict)
