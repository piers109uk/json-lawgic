from typing import List, cast

from pydantic import BaseModel, Field

from json_lawgic.logger import logger
from json_lawgic.langfuse_setup import get_tracing_handler, langfuse
from json_lawgic.model import AIModel, get_model
from json_lawgic.prompts import PromptManager
from json_lawgic.types import Law
from json_lawgic.util import pick


class EvaluationResult(BaseModel):
    score: float = Field(description="Correctness score between 0 and 1", ge=0, le=1)
    reasoning: List[str] = Field(description="A list containing incomplete or incorrect points, if any")
    feedback: str = Field(
        description="Provide a one sentence reasoning, briefly specify which points were missed, if any",
    )


class JsonLogicEvaluator:
    def __init__(self):
        self.llm = get_model(AIModel.openai_4o).with_structured_output(EvaluationResult)
        self.prompt = PromptManager.get_prompt_template("evaluate-interpretation")

    def evaluate(self, rules: dict, law: Law, trace_id: str) -> EvaluationResult:
        logger.info(f"Evaluating rules for law: {law['id']}")
        prompt = self.prompt.invoke({"rules": rules, "law": law})
        result = self.llm.invoke(prompt)  # {"callbacks": [langfuse_handler]}
        eval_result = cast(EvaluationResult, result)
        langfuse.score(trace_id=trace_id, name="correctness", value=eval_result.score, comment=eval_result.feedback)
        logger.info(f"JsonLogicEvaluator law: {law['id']} score: {eval_result.score} feedback: {eval_result.feedback}")

        return eval_result


# langfuse.score(
#     trace_id=message.trace_id,
#     observation_id=message.generation_id, # optional
#     name="accuracy",
#     value=0.9,
#     comment="Factually correct", # optional
#     id="unique_id" # optional, can be used as an indempotency key to update the score subsequently
#     config_id="78545-6565-3453654-43543" # optional, to ensure that the score follows a specific min/max value range
#     data_type="NUMERIC" # optional, possibly inferred
# )
