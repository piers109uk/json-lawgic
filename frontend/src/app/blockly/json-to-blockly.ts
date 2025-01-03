import { AdditionalOperation, RulesLogic } from "json-logic-js"

type JsonLogicRules = RulesLogic<AdditionalOperation>

type BlocklyBlockInput = {
  block?: BlocklyBlock
  shadow?: BlocklyBlock
}

type BlocklyBlock = {
  kind: string
  type: string
  fields?: { [key: string]: object }
  inputs?: { [key: string]: BlocklyBlockInput }
  children?: BlocklyBlock[]
}

export function convertJsonLogicToBlocklyBlocks(jsonLogic: JsonLogicRules): BlocklyBlock[] | null {
  console.log({ jsonLogic })
  if (jsonLogic === null) return null

  return []
}

// export function getBlocklyType(key: string, value: object): string | null {
//   const type = typeMap[key]
//   if (type) return type
// }

// const typeMap: Record<string, string> = {
//   if: "if_logic",
//   var: "var",
//   "!=": "logical",
//   "===": "logical",
//   "==": "logical",
//   "!==": "logical",
//   "!": "not",
//   "!!": "not",
//   and: "boolean",
//   or: "boolean",
//   min: "minmax",
//   max: "minmax",
//   "*": "arithmetic",
//   "/": "arithmetic",
//   "+": "arithmetic",
//   "-": "arithmetic",
//   "%": "arithmetic",
//   map: "map_filter",
//   reduce: "map_filter",
//   filter: "map_filter",
//   all: "map_filter",
//   none: "map_filter",
//   some: "map_filter",
//   merge: "merge",
//   ">": "comparison",
//   ">=": "comparison",
//   "<": "comparison",
//   "<=": "comparison",
//   // in: Array.isArray(json[key][1]) ? "InMiss" : "inString",
//   missing: "InMiss",
//   missing_some: "InMiss",
//   cat: "catString",
//   substr: "subStr",
// }
