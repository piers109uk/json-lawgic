#  TODO fix json logic
# rule = {
#     "and": [
#         {"==": [{"var": "jurisdiction_type"}, "concurrent"]},
#         {"==": [{"var": "entity_type"}, "county"]},
#         {"==": [{"var": "boundary_extension"}, "across_waters"]},
#     ]
# }
# examples = [
#     {"jurisdiction_type": "concurrent", "entity_type": "county", "boundary_extension": "across_waters"},
#     {"jurisdiction_type": "exclusive", "entity_type": "state", "boundary_extension": "across_waters"},
#     {"jurisdiction_type": "concurrent", "entity_type": "county", "boundary_extension": "land_only"},
# ]

# rules = {"and": [{"<": [{"var": "temp"}, 110]}, {"==": [{"var": "pie.filling"}, "apple"]}]}

# data = {"temp": 100, "pie": {"filling": "apple"}}

# print(jsonLogic(rules, data))
# print(jsonLogic(rule, examples[0]))
# r = [jsonLogic(rule, x) for x in examples]
# print(r)
# law_dict = interpreter.interpret_law(law_object)
# pprint(law_dict)


# def validate_interpretation(self, interpreted_law: JsonLogicInterpretation) -> list[bool]:
#     rule, examples = interpreted_law.rule, interpreted_law.examples
#     print(rule)
#     print(examples)

#     example_results = [jsonLogic(rule, x) for x in examples]
#     return example_results
