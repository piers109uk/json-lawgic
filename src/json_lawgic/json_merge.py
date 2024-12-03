import json
import glob


def merge_json_files(input_directory: str, output_file: str):
    """Merges all JSON files in the input directory into a single file."""
    json_files = glob.glob(f"{input_directory}/*.json")
    combined_data = []
    for file in json_files:
        with open(file, "r", encoding="utf-8") as f:
            data = json.load(f)
            combined_data.append(data)
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(combined_data, f, indent=2)
    print(f"Combined JSON written to {output_file}")
    return combined_data


if __name__ == "__main__":
    input_directory = "data/examples-interpreted"
    output_file = "data/showcase.json"
    merge_json_files(input_directory, output_file)
