from enum import Enum

from langchain_core.prompts import ChatPromptTemplate
from langfuse import Langfuse

# Initialize Langfuse client
langfuse = Langfuse()


class PromptManager:
    @staticmethod
    def get_prompt_template(name: str) -> ChatPromptTemplate:
        langfuse_prompt = langfuse.get_prompt(name, label="latest")

        return ChatPromptTemplate.from_template(langfuse_prompt.get_langchain_prompt())


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
