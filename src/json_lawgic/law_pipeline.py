import asyncio
from pathlib import Path
from pprint import pprint

from json_lawgic.data_io import read_json, write_json
from json_lawgic.json_merge import merge_json_files
from json_lawgic.law_interpreter import LawInterpreter
from json_lawgic.logger import logger

interpreter = LawInterpreter()
# law_object = read_json("data/default/000000001.json")
# law_dict = interpreter.interpret_law(law_object)
# pprint(law_dict)


async def _process_file(file: Path, output_folder: str):
    law_object = read_json(file)

    if law_object.get("text") is None:
        return
    logger.info(f"Processing law file: {file.name}")
    try:
        law_rules = await interpreter.ainterpret_law(law_object)
        interpreted_law = {**law_object, **law_rules}
        new_path = f"{output_folder}/{file.name}"
        logger.info(f"Interpreted law written to {new_path}")

        write_json(new_path, interpreted_law)
    except Exception as e:
        logger.error(f"Error interpreting law: {file.name}")
        logger.error(e)


async def run_pipeline(input_folder: str, output_folder: str, limit: int = 150):
    p = Path(input_folder)
    files = sorted(p.glob("*.json"))

    tasks = [_process_file(file, output_folder) for file in files[:limit]]
    await asyncio.gather(*tasks)


if __name__ == "__main__":
    # input_folder = "data/default"
    # output_folder = "data/interpreted"
    # output_file = "data/interpreted-laws.json"

    input_folder = "data/examples"
    output_folder = "data/examples-interpreted"
    output_file = "data/showcase.json"

    asyncio.run(run_pipeline(input_folder, output_folder))
    combined = merge_json_files(output_folder, output_file)
    # A little data on what we've done
    for law in combined:
        print(f"{law["title"]} {law["url"]} {len(law["rules"])}")
