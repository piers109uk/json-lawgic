from enum import Enum
from typing import Literal

from langchain_core.prompts import ChatPromptTemplate
from langfuse import Langfuse

# Initialize Langfuse client
langfuse = Langfuse()

PromptType = Literal[
    "interpret-law",
    "simplify-interpretation",
    "review-interpretation",
    "interpret-with-feedback",
    "evaluate-interpretation",
]


class PromptManager:
    @staticmethod
    def get_prompt_template(prompt_type: PromptType) -> ChatPromptTemplate:
        if prompt_type == "review-interpretation":
            return ChatPromptTemplate.from_template(review_prompt)
        elif prompt_type == "interpret-with-feedback":
            return ChatPromptTemplate.from_template(interpret_with_feedback_prompt)
        elif prompt_type == "evaluate-interpretation":
            return ChatPromptTemplate.from_template(evaluate_prompt)
        else:
            langfuse_prompt = langfuse.get_prompt(prompt_type, label="latest")
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

review_prompt = """
You are a critical reviewer of JSON Logic rules that encode legal requirements.
Review each rule individually and provide detailed feedback on:
1. Correctness - Do the rules accurately capture the law's requirements?
2. Completeness - Are any important aspects of the law missing?
3. Clarity - Are the rules clear and well-structured?
4. Quality of examples - Are the examples comprehensive and useful?

For each rule, provide specific feedback and boolean assessments.
Only approve the entire ruleset if all rules are correct, complete, clear, and have good examples.

Law: {law}

Rules: {rules}
"""

interpret_with_feedback_prompt = """
You are looking to express laws as JsonLogic and have received feedback on your previous attempt.

Here is some info on how JSON logic works:
---
{json_logic}
---

Please express the following law as one or more JSON logic rules:
{law}

Your previous attempt at rules was:
{previous_attempt}

You received this feedback:
{reviews}

Please revise your rules taking into account this feedback. Focus specifically on addressing the concerns raised.
"""

evaluate_prompt = """
Evaluate the correctness of the JsonLogic interpretation of the law on a continuous scale from 0 to 1. An interpretation can be considered correct (Score: 1) if it includes all the key logic from the law and if every part of the logic presented in the interpretation is factually supported by the law.

Input:
Interpretation: 
```json
{rules}
```

Law: 
{law}


Be as comprehensive as possible.
"""
