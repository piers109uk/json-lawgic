import os
from typing import Any, Optional
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langfuse.callback import CallbackHandler
from langfuse import Langfuse

load_dotenv()


LANGFUSE_PUBLIC_KEY = os.getenv("LANGFUSE_PUBLIC_KEY")
LANGFUSE_SECRET_KEY = os.getenv("LANGFUSE_SECRET_KEY")
LANGFUSE_HOST = os.getenv("LANGFUSE_HOST")


def get_tracing_handler(metadata: Optional[dict[str, Any]] = None, tags: Optional[list[str]] = None):
    return CallbackHandler(
        public_key=LANGFUSE_PUBLIC_KEY, secret_key=LANGFUSE_SECRET_KEY, host=LANGFUSE_HOST, metadata=metadata, tags=tags
    )


langfuse = Langfuse(public_key=LANGFUSE_PUBLIC_KEY, secret_key=LANGFUSE_SECRET_KEY, host=LANGFUSE_HOST)

if __name__ == "__main__":
    chain = ChatOpenAI(model="gpt-4o-mini")
    tracing_handler = get_tracing_handler()

    res = chain.invoke("hi", config={"callbacks": [tracing_handler]})
    print(res.content)
