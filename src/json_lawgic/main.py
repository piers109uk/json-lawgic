import json
from pathlib import Path

from data_readers import read_json

# https://openai.com/api/pricing/

INPUT_PRICE = 2.50  # per million input tokens
OUTPUT_PRICE = 10.00  # per million output tokens


def main():
    # count characters in
    input_folder = "data/default"
    p = Path(input_folder)
    files = sorted(p.glob("*.json"))
    chars = 0
    for file in files:
        law_object = read_json(file)
        text = law_object.get("text")
        if text is None:
            continue
        chars += len(text)
    print(f"Total characters: {chars}")
    print(f"Total Laws: {len(files)}")
    print(f"Average characters per law: {chars / len(files)}")

    input_tokens = chars / 4
    output_token_est = input_tokens / 10
    print(f"Total input tokens: {input_tokens}. Total output tokens: {output_token_est}")
    estimated_cost = (input_tokens / 1000000) * INPUT_PRICE + (output_token_est / 1000000) * OUTPUT_PRICE
    print(f"Estimated cost: ${estimated_cost}")


if __name__ == "__main__":
    main()
