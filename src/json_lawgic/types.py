from typing import TypedDict

# TODO: consider mapping from TypedDict to Pydantic so the types exist in one place


class Law(TypedDict):
    id: str
    url: str
    title: str
    text: str


class RuleVariable(TypedDict):
    name: str
    description: str


class JsonLogicRule(TypedDict):
    rule: dict
    examples: list[dict]
    variables: list[RuleVariable]
    consequences: list[str]


class InterpretedLaw(Law):
    rules: list[dict]
