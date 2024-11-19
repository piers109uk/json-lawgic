import json
from pprint import pprint
from data_readers import read_json
from law_interpreter import LawInterpreter
from pathlib import Path
import os

interpreter = LawInterpreter()
# law_object = read_json("data/default/000000001.json")
# law_dict = interpreter.interpret_law(law_object)
# pprint(law_dict)

p = Path("data/default")
limit = 10

files = sorted(p.glob("*.json"))


def write_json(path: str | Path, data: dict):
    with open(path, "w") as f:
        json.dump(data, f, indent=2)


for file in files:
    law_object = read_json(file)
    if limit == 0:
        break
    if law_object.get("text") is None:
        continue
    # if "text" in law_object:
    #     law_dict = interpreter.interpret_law(law_object)
    # pprint(law_dict)
    print(file)
    pprint(law_object)
    limit -= 1
    law_rules = interpreter.interpret_law(law_object)
    interpreted_law = {**law_object, **law_rules}
    new_path = f"data/interpreted/{file.name}"
    print(new_path)
    write_json(new_path, interpreted_law)
