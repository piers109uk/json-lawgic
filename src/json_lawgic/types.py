from typing import TypedDict
from pydantic import BaseModel, Field

# TODO: consider mapping from TypedDict to Pydantic so the types exist in one place

# TypedDict models


class Law(TypedDict):
    id: str
    url: str
    title: str
    text: str


class RuleVar(TypedDict):
    name: str
    description: str


class JsonLogicRule(TypedDict):
    rule: dict
    examples: list[dict]
    variables: list[RuleVar]
    consequences: list[str]


class InterpretedLaw(Law):
    rules: list[dict]


# PYDANTIC MODELS


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
