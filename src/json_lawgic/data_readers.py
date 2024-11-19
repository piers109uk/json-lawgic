import json
from pathlib import Path


def read_json(path: str | Path) -> dict:
    with open(path) as json_data:
        return json.load(json_data)


def read_text(path: str | Path):
    with open(path) as f:
        return f.read()
