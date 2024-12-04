def omit(d: dict, keys_to_omit: list) -> dict:
    return {k: v for k, v in d.items() if k not in keys_to_omit}


def pick(d: dict, keys_to_pick: list) -> dict:
    return {k: d[k] for k in keys_to_pick if k in d}
