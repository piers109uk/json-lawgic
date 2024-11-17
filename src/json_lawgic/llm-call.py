from langflow.load import run_flow_from_json

TWEAKS = {
    "URL-Bxave": {},
    "Prompt-k1Ak4": {},
    # "OpenAIModel-qiC7e": {},
    "Prompt-HhPtT": {},
    "OpenAIModel-qY2Ne": {},
    "Prompt-0zTiW": {},
    "TextInput-DZ5w9": {},
    # "OpenAIModel-JHLHE": {},
    "JSONtoData-xTsGG": {},
    "TextInput-yyPQm": {},
    "LMStudioModel-0stqd": {},
    "JSONtoData-EnvQu": {},
}

result = run_flow_from_json(
    flow="basic-prompting.json",
    input_value="hi",
    session_id="1",
    # session_id="", # provide a session id if you want to use session state
    fallback_to_env_vars=True,  # False by default
    # tweaks=TWEAKS,
)
print(result)
