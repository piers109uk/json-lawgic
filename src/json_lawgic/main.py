import json


def main():
    with open("data/default/000000001.json") as json_data:
        d = json.load(json_data)
        print(d)


if __name__ == "__main__":
    main()
