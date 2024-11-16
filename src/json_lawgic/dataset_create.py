from datasets import load_dataset

statutes = load_dataset("data/default", data_files="*.json")

filtered_statutes = statutes.filter(lambda x: not x["repealed"]).remove_columns(
    ["repealed"]
)
print(filtered_statutes)
filtered_statutes.push_to_hub("piers109uk/MN-Statutes", private=False)
