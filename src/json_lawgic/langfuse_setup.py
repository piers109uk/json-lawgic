import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langfuse.callback import CallbackHandler

load_dotenv()


LANGFUSE_PUBLIC_KEY = os.getenv("LANGFUSE_PUBLIC_KEY")
LANGFUSE_SECRET_KEY = os.getenv("LANGFUSE_SECRET_KEY")
LANGFUSE_HOST = os.getenv("LANGFUSE_HOST")


langfuse_handler = CallbackHandler(public_key=LANGFUSE_PUBLIC_KEY, secret_key=LANGFUSE_SECRET_KEY, host=LANGFUSE_HOST)

if __name__ == "__main__":
    chain = ChatOpenAI(model="gpt-4o-mini")
    res = chain.invoke("hi", config={"callbacks": [langfuse_handler]})
    print(res.content)
