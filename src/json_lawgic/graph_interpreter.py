import json
from langgraph.graph import Graph, StateGraph, START, END
from typing import Annotated, Literal, Optional, TypedDict, cast
from json_lawgic.data_io import read_json, read_text
from json_lawgic.model import AIModel, get_model
from json_lawgic.prompts import PromptManager, PromptType
from json_lawgic.types import JsonLogicRules, Law
from json_lawgic.langfuse_setup import get_tracing_handler
from json_lawgic.util import pick
from json_lawgic.logger import logger
from pydantic import BaseModel, Field


class RuleReview(BaseModel):
    rule_index: int
    is_correct: bool
    is_complete: bool
    is_clear: bool
    has_good_examples: bool
    feedback: str
    rating: Optional[float] = Field(description="Between 0 and 1")


class RulesReviewResponse(BaseModel):
    reviews: list[RuleReview]
    is_approved: bool
    overall_feedback: str
    overall_rating: Optional[float] = Field(description="Between 0 and 1")


class AgentState(TypedDict):
    law: Law
    current_rules: Optional[JsonLogicRules]
    attempts: int
    feedback: str
    is_approved: bool
    rating: Optional[float]


max_attempts = 3


class InterpreterAgent:
    max_attempts = max_attempts
    json_logic = read_text("markdown/json-logic.md")

    def __init__(self, llm):
        self.llm = llm.with_structured_output(JsonLogicRules)
        self.prompt = PromptManager.get_prompt_template("interpret-law")

    def invoke(self, state: AgentState) -> AgentState:
        logger.info(f"InterpreterAgent.invoke: {state['attempts']}")
        if state["is_approved"] or state["attempts"] >= self.max_attempts:
            return state

        prompt_vars = {
            "json_logic": self.json_logic,
            "law": state["law"]["text"],
        }

        if state["attempts"] > 0:
            prompt_vars["previous_attempt"] = json.dumps(state["current_rules"].model_dump(), indent=2)
            prompt_vars["feedback"] = state["feedback"]
            self.prompt = PromptManager.get_prompt_template("interpret-with-feedback")
        else:
            self.prompt = PromptManager.get_prompt_template("interpret-law")

        prompt = self.prompt.invoke(prompt_vars)

        response = self.llm.invoke(prompt)
        return {**state, "current_rules": response, "attempts": state["attempts"] + 1}


class ReviewerAgent:
    max_attempts = max_attempts

    def __init__(self, llm):
        self.llm = llm
        self.prompt = PromptManager.get_prompt_template("review-interpretation")

    def invoke(self, state: AgentState) -> AgentState:
        if state["is_approved"] or state["attempts"] >= self.max_attempts:
            return state

        current_rules = json.dumps(state["current_rules"].model_dump(), indent=2)

        prompt = self.prompt.invoke({"law": state["law"]["text"], "rules": current_rules})

        response = self.llm.invoke(prompt)
        is_approved = "APPROVED" in response.content
        logger.info(f"ReviewerAgent.invoke: is_approved: {is_approved}")
        logger.info(f"ReviewerAgent.invoke: content: {response.content}")
        return {**state, "feedback": response.content, "is_approved": is_approved}


def create_graph(interpreter_llm, reviewer_llm):
    # Create our agents
    interpreter = InterpreterAgent(interpreter_llm)
    reviewer = ReviewerAgent(reviewer_llm)

    # Create workflow
    workflow = StateGraph(AgentState)

    # Add nodes
    workflow.add_node("interpret", interpreter.invoke)
    workflow.add_node("review", reviewer.invoke)

    # Add edges
    workflow.add_edge("interpret", "review")

    def should_continue(state: AgentState):
        if not state["is_approved"] and state["attempts"] < max_attempts:
            return "interpret"
        return END

    workflow.add_conditional_edges("review", should_continue, {"interpret": "interpret", END: END})

    # workflow.add_edge("review", "interpret")

    # Add conditional edges
    workflow.set_entry_point("interpret")

    return workflow.compile()


def interpret_law_with_review(law: Law) -> JsonLogicRules:
    interpreter_llm = get_model(AIModel.openai_4o)
    reviewer_llm = get_model(AIModel.openai_4o)

    graph = create_graph(interpreter_llm, reviewer_llm)

    initial_state: AgentState = {
        "law": law,
        "attempts": 0,
        "feedback": "",
        "is_approved": False,
        "rating": None,
        "current_rules": None,
    }
    metadata = pick(law, ["id", "url", "title"])
    langfuse_handler = get_tracing_handler(metadata)
    final_state = graph.invoke(initial_state, config={"callbacks": [langfuse_handler]})
    return final_state["current_rules"]


if __name__ == "__main__":
    file_name = "000047905.json"
    input_file = f"data/default/{file_name}"
    law = cast(Law, read_json(input_file))
    law_rules = interpret_law_with_review(law)
    print(law_rules)
