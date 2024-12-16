from enum import Enum

from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI


class AIModel(Enum):
    claude_sonnet = "claude-3-5-sonnet-latest"
    openai_4o = "gpt-4o"


def get_model(model: AIModel):
    if model == AIModel.claude_sonnet:
        return ChatAnthropic(
            model_name=model.value, max_tokens_to_sample=8192, temperature=0, timeout=None, max_retries=2, stop=None
        )
    elif model in [AIModel.openai_4o]:
        return ChatOpenAI(model=model.value, temperature=0)
    else:
        return ChatOpenAI(model=AIModel.openai_4o.value, temperature=0)
