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

# TODO: Assess the quality of the prompts (and recent prompt engineering)


class PromptManager:
    @staticmethod
    def get_prompt_template(prompt_type: PromptType) -> ChatPromptTemplate:
        match prompt_type:
            case "interpret-law":
                return ChatPromptTemplate.from_template(interpret_prompt)
            case "simplify-interpretation":
                return ChatPromptTemplate.from_template(simplify_prompt)
            case "review-interpretation":
                return ChatPromptTemplate.from_template(review_prompt)
            case "interpret-with-feedback":
                return ChatPromptTemplate.from_template(interpret_with_feedback_prompt)
            case "evaluate-interpretation":
                return ChatPromptTemplate.from_template(evaluate_prompt)
            case _:
                langfuse_prompt = langfuse.get_prompt(prompt_type, label="latest")
                return ChatPromptTemplate.from_template(langfuse_prompt.get_langchain_prompt())


interpret_prompt = """
I am looking to express laws as JsonLogic.

Here is some info on how JSON logic works:
---
{json_logic}
---

Please express the following law as one or more JSON logic rules:
---
{law}
---

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
You are a critical reviewer of JsonLogic rules that represent the given law.
The JsonLogic rules can evaluate true or false depending on the variables.
Your job is to ensure the rules represent the LOGIC of the law as comprehensively as possible. The logic must be comprehensive, even if a lot of information is contained in the variables.
If any of the rules are incorrect or incomplete, provide feedback specifying precisely which elements are missed. 
If any rule could be expressed in a simpler way, provide that as feedback.
If any rules which should exist are missing, recommend them as new indexes.

For each rule, list what could be improved or an empty string..
Only approve the entire ruleset if the law is completely covered and all rules are correct, complete, clear, and have good examples of true/false evaluations.

LAW: 
{law}

RULES: 
{rules}

---
Remember the rules follow the JsonLogic DSL and it should be for them to evaluate true or false depending on the variables.
Remember to only provide feedback on how well the rules match the logic of the law. 
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


# Review each rule individually and provide detailed feedback on:
# 1. Correctness - Do the rules accurately capture the law's requirements?
# 2. Completeness - Are any important aspects of the law missing?
# 3. Clarity - Are the rules clear and well-structured?
# 4. Quality of examples - Are the examples comprehensive and useful?
