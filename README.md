# Json Lawgic

An experiment to express the law as [json-logic](https://jsonlogic.com/)

## Motivation

I want to see if there's an enhanced and innovative way to express the law.
My motivation for doing this is best expressed here: https://www.concordtech.dev/blog/law-expression#motivation

## Running the app

To just see the app, feel free to visit the [demo site](https://json-lawgic.vercel.app/)

To run the front end locally:
Ensure you have [pnpm](https://pnpm.io/) installed and run:

```bash
cd frontend
pnpm install
pnpm dev
```

To run the backend locally:

Ensure you have [uv](https://github.com/astral-sh/uv) installed and run:

1. `uv venv && source venv/bin/activate` to make and activate a virtual environment
2. `uv sync` to install the dependencies

Make a .env file in the root directory containing `OPENAI_API_KEY=your-api-key` and optionally (if you want langfuse instrumentation)

```config

LANGFUSE_SECRET_KEY=your-langfuse-secret-key
LANGFUSE_PUBLIC_KEY=your-langfuse-public-key
LANGFUSE_HOST="https://us.cloud.langfuse.com"
```

Then run the LLM on laws with `python src/json_lawgic/law_pipeline.py`

## Data extraction

To see how I fetched the data, see the [law scraper project](https://github.com/piers109uk/law-scraper)

## TO DO

- [ ] Support multiple rules for one law
- [ ] Run on a larger body of laws
- [ ] Classify laws into types using those referenced in [SALI](https://github.com/sali-legal)
- [ ] Incorporate testing into the pipeline
  - [ ] Fix JsonLogic for Python
  - [ ] Build self-review capability
- [ ] Try running model fast locally https://llama-cpp-python.readthedocs.io/en/latest/install/macos/
- [x] Instrument with Langfuse
- [x] Law search & selector
- [ ] Law interpretation versioning - when we update the interpretation, keep track of the old versions
- [ ] Visual editor with Blockly just like https://github.com/katirasole/JSONLogic-Editor (see https://katirasole.github.io/JSONLogic-Editor/ )

# Disclaimer

**Legal**: This is intended as a proof of concept. Nothing found here (or anything else I build) should be used as legal advice.

**Technical**: This is a personal "hacked out" prototype to illustrate a concept. It's safe to assume some corners have been cut along the way. Try not to judge too harshly!
