import json
import glob

# Directory containing the JSON files
input_directory = "data/interpreted"
output_file = "data/interpreted-laws.json"

# Use glob to find all JSON files in the directory
json_files = glob.glob(f"{input_directory}/*.json")

combined_data = []

# Loop through each JSON file and append its content to the combined_data list
for file in json_files:
    with open(file, "r", encoding="utf-8") as f:
        data = json.load(f)
        combined_data.append(data)

# Write the combined data to a new JSON file as an array
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(combined_data, f, indent=2)

print(f"Combined JSON written to {output_file}")
