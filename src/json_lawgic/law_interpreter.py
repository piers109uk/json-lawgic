import asyncio
from pprint import pprint
from typing import cast

from dotenv import load_dotenv
from langchain_core.prompts import PromptTemplate
from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
from logger import logger
from pydantic import BaseModel, Field

from data_io import read_json, read_text, write_json
from langfuse_setup import langfuse_handler

# Load environment variables from .env file
load_dotenv()

llm = ChatAnthropic(
    model_name="claude-3-5-sonnet-latest",
    max_tokens_to_sample=8192,  #
    temperature=0,
    timeout=None,
    max_retries=2,
    stop=None,
)
llm = ChatOpenAI(model="gpt-4o", temperature=0)

# TODO: Compare multi-agent with this approach - can one agent split the law up and another define the rules?
# Is it effective to have a reviewer & simplifier agent?


class RuleVariable(BaseModel):
    """A variable used in the JSON logic rule."""

    name: str = Field(description="The name of the variable referenced in the rule")
    description: str = Field(description="A description of what the variable represents")


class JsonLogicInterpretation(BaseModel):
    """A JSON logic interpretation."""

    rule: object = Field(description="The pure JSON logic rule expressed as a JSON object")
    examples: list[object] = Field(
        description="Three examples of data that we could run the JsonLogic rule on. Aim to make some that evaluate to true and some to false."
    )
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


interpret_prompt = """
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
// Three examples of data that we could run the JsonLogic rule on. Aim to make some that evaluate to true and some to false.
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

Express it as completely as possible without leaving out any information.

"""

simplify_prompt = """
Please review the following JsonLogic interpretation of this law.
If the JsonLogic Rules can be simplified, please return the interpretation with the rules simplified.
If the interpretations are incomplete or incorrect, please update them to fix this.
If the JsonLogic Rules cannot be simplified and are complete and correct, please return the original interpretation.

Here is some info on how JSON logic works:
---
{json_logic}
---

Here is the law:
---
{law}
---

And here are the corresponding rules interpreted from the law:
---
{interpretation}
---

"""

interpret_prompt_template = PromptTemplate.from_template(interpret_prompt)
simplify_prompt_template = PromptTemplate.from_template(simplify_prompt)


class LawInterpreter:
    json_logic = read_text("markdown/json-logic.md")

    def interpret_law(self, law_object: dict) -> dict:
        """Returns a dict containing rules"""
        law_text = law_object.get("text")
        prompt = interpret_prompt_template.invoke({"json_logic": self.json_logic, "law": law_text})
        structured_llm = llm.with_structured_output(JsonLogicRules)

        response = cast(JsonLogicRules, structured_llm.invoke(prompt, config={"callbacks": [langfuse_handler]}))

        res_dict = response.model_dump()
        return {**res_dict}

    async def ainterpret_law(self, law_object: dict) -> dict:
        """Returns a dict containing rules"""
        law_text = law_object.get("text")
        prompt = await interpret_prompt_template.ainvoke({"json_logic": self.json_logic, "law": law_text})

        structured_llm = llm.with_structured_output(JsonLogicRules)

        response = await structured_llm.ainvoke(prompt, config={"callbacks": [langfuse_handler]})

        rules = cast(JsonLogicRules, response)

        res_dict = rules.model_dump()
        return {**res_dict}

    async def asimplify_interpretation(self, law_object: dict, interpretation: dict) -> dict:
        """Returns a dict containing rules"""
        law_text = law_object.get("text")
        prompt = simplify_prompt_template.invoke(
            {"json_logic": self.json_logic, "law": law_text, "interpretation": interpretation}
        )
        structured_llm = llm.with_structured_output(JsonLogicRules)

        response = await structured_llm.ainvoke(prompt, config={"callbacks": [langfuse_handler]})

        rules = cast(JsonLogicRules, response)

        res_dict = rules.model_dump()
        return {**res_dict}


def _run_interpret(input_file: str, output_file: str):
    interpreter = LawInterpreter()
    law_object = read_json(input_file)
    law_dict = interpreter.interpret_law(law_object)
    merged_dict = {**law_object, **law_dict}
    write_json(output_file, merged_dict)
    pprint(law_dict)


def _simplify_interpretation(interpreted_file: str):
    interpreter = LawInterpreter()
    law_interpretation = read_json(interpreted_file)
    simplified = asyncio.run(interpreter.asimplify_interpretation(law_interpretation, law_interpretation["rules"]))
    simplified_law = {**law_interpretation, **simplified}
    write_json(interpreted_file, simplified_law)
    pprint(simplified_law)


if __name__ == "__main__":
    interpreter = LawInterpreter()
    file_name = "000000001.json"
    input_file = f"data/default/{file_name}"
    output_file = f"data/tests/{file_name}"
    _run_interpret(input_file, output_file)

    # interpreted_file = "data/examples-interpreted/000049272.json"
    # _simplify_interpretation(interpreted_file)
