import json
from pprint import pprint
from data_readers import read_json
from law_interpreter import LawInterpreter
from json_merge import merge_json_files
from pathlib import Path

interpreter = LawInterpreter()
# law_object = read_json("data/default/000000001.json")
# law_dict = interpreter.interpret_law(law_object)
# pprint(law_dict)


def write_json(path: str | Path, data: dict):
    with open(path, "w") as f:
        json.dump(data, f, indent=2)


def run_pipeline(input_folder: str, output_folder: str, limit: int = 50):
    p = Path(input_folder)
    files = sorted(p.glob("*.json"))
    for file in files:
        law_object = read_json(file)
        if limit == 0:
            break
        if law_object.get("text") is None:
            continue

        print(file)
        pprint(law_object)
        limit -= 1
        law_rules = interpreter.interpret_law(law_object)

        interpreted_law = {**law_object, **law_rules}
        new_path = f"{output_folder}/{file.name}"
        print(new_path)
        write_json(new_path, interpreted_law)


if __name__ == "__main__":
    input_folder = "data/examples"
    output_folder = "data/examples-interpreted"

    run_pipeline(input_folder, output_folder)
    output_file = "data/showcase.json"
    merge_json_files(output_folder, output_file)
