import asyncio
from enum import Enum
from pprint import pprint
from typing import cast
import uuid

from dotenv import load_dotenv
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

from json_lawgic.data_io import read_json, read_text, write_json
from json_lawgic.evaluator import JsonLogicEvaluator
from json_lawgic.langfuse_setup import get_tracing_handler
from json_lawgic.logger import logger
from json_lawgic.model import AIModel, get_model
from json_lawgic.prompts import PromptManager, PromptType
from json_lawgic.types import JsonLogicRules, Law
from json_lawgic.util import omit, pick

# Load environment variables from .env file
load_dotenv()


# TODO: Compare multi-agent with this approach - can one agent split the law up and another define the rules?
# Is it effective to have a reviewer & simplifier agent?
# TODO: For the benefit of evaluation, begin using a chat-based system with a system prompt and the law as the input
# TODO use https://langfuse.com/docs/scores/custom with jsonLogic eval to grade traces


interpret_prompt_template = PromptManager.get_prompt_template("interpret-law")
simplify_prompt_template = PromptManager.get_prompt_template("simplify-interpretation")


class LawInterpreter:
    json_logic = read_text("markdown/json-logic.md")

    def __init__(self, model: AIModel = AIModel.openai_4o):
        self.model_name = model.value
        self.llm = get_model(model)

    def interpret_law(self, law_object: dict) -> dict:
        """Returns a dict containing rules"""
        law_text = law_object.get("text")
        prompt = interpret_prompt_template.invoke({"json_logic": self.json_logic, "law": law_text})
        structured_llm = self.llm.with_structured_output(JsonLogicRules)

        metadata = pick(law_object, ["id", "url", "title"])
        tags = [self.model_name]
        tracing_handler = get_tracing_handler(metadata, tags)

        response = cast(JsonLogicRules, structured_llm.invoke(prompt, config={"callbacks": [tracing_handler]}))
        res_dict = response.model_dump()
        return {**res_dict}

    async def ainterpret_law(self, law_object: dict) -> dict:
        """Returns a dict containing rules"""
        law_text = law_object.get("text")
        prompt = interpret_prompt_template.invoke({"json_logic": self.json_logic, "law": law_text})

        structured_llm = self.llm.with_structured_output(JsonLogicRules)
        metadata = pick(law_object, ["id", "url", "title"])
        tags = [self.model_name]
        tracing_handler = get_tracing_handler(metadata, tags)
        run_id = str(uuid.uuid4())
        response = await structured_llm.ainvoke(prompt, config={"callbacks": [tracing_handler], "run_id": run_id})

        rules = cast(JsonLogicRules, response)

        res_dict = rules.model_dump()
        JsonLogicEvaluator().evaluate(res_dict, cast(Law, law_object), run_id)
        return {**res_dict}

    async def asimplify_interpretation(self, law_object: dict, interpretation: dict) -> dict:
        """Returns a dict containing rules"""

        law_text = law_object.get("text")
        prompt = simplify_prompt_template.invoke(
            {"json_logic": self.json_logic, "law": law_text, "interpretation": interpretation}
        )
        structured_llm = self.llm.with_structured_output(JsonLogicRules)
        metadata = pick(law_object, ["id", "url", "title"])
        tags = [self.model_name]
        tracing_handler = get_tracing_handler(metadata, tags)
        response = await structured_llm.ainvoke(prompt, config={"callbacks": [tracing_handler]})

        rules = cast(JsonLogicRules, response)

        res_dict = rules.model_dump()

        return {**res_dict}


def _run_interpret(input_file: str, output_file: str):
    interpreter = LawInterpreter(AIModel.openai_4o)
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
    file_name = "000047905.json"
    input_file = f"data/default/{file_name}"
    output_file = f"data/tests/{file_name}"
    _run_interpret(input_file, output_file)

    # interpreted_file = "data/examples-interpreted/000049272.json"
    # _simplify_interpretation(interpreted_file)
