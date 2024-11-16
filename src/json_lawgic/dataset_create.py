from datasets import load_dataset

statutes = load_dataset("data/default", data_files="*.json")

filtered_statutes = statutes.filter(lambda x: not x["repealed"])

print(statutes)
print(filtered_statutes)

# dataset.push_to_hub("piers109uk/MN-Statutes", private=False)
