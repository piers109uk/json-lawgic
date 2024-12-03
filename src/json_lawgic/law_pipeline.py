import json
from pathlib import Path
from pprint import pprint

from json_merge import merge_json_files
from law_interpreter import LawInterpreter

from json_lawgic.data_io import read_json, write_json

interpreter = LawInterpreter()
# law_object = read_json("data/default/000000001.json")
# law_dict = interpreter.interpret_law(law_object)
# pprint(law_dict)


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
    input_folder = "data/default"
    output_folder = "data/interpreted"

    run_pipeline(input_folder, output_folder)
    output_file = "data/interpreted-laws.json"
    merge_json_files(output_folder, output_file)
