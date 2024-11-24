# Json Lawgic

An experiment to express the law as [json-logic](https://jsonlogic.com/)

## Motivation

I want to see if there's an enhanced and innovative way to express the law.
My motivation for doing this is best expressed here: https://www.concordtech.dev/blog/law-expression#motivation

## Running the app

To just see the app, feel free to visit the [demo site](https://json-lawgic.vercel.app/)

To run the front end locally:

```bash
cd frontend
pnpm install
pnpm dev
```

## Data extraction

To see how I fetched the data, see the [law scraper project](https://github.com/piers109uk/law-scraper)

## TO DO

- [ ] Try running model fast locally https://llama-cpp-python.readthedocs.io/en/latest/install/macos/
- [ ] Instrument with Langfuse
- [ ] Law search & selector
- [ ] Law interpretation versioning - when we update the interpretation, keep track of the old versions
- [ ] Fix JsonLogic for Python
- [ ] Visual editor with Blockly just like https://github.com/katirasole/JSONLogic-Editor (see https://katirasole.github.io/JSONLogic-Editor/ )

# Disclaimer

Legal: This is intended as a proof of concept. Nothing found here (or anything else I build) should be used as legal advice.

Technical: This is a personal "hacked out" prototype to illustrate a concept. It's safe to assume some corners have been cut along the way. Try not to judge too harshly!
