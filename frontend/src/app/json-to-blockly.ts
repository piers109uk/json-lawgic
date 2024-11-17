import { AdditionalOperation, RulesLogic } from "json-logic-js"

type JsonLogicRules = RulesLogic<AdditionalOperation>

type BlocklyBlockInput = {
  block?: BlocklyBlock
  shadow?: BlocklyBlock
}

type BlocklyBlock = {
  kind: string
  type: string
  fields?: { [key: string]: any }
  inputs?: { [key: string]: BlocklyBlockInput }
  children?: BlocklyBlock[]
}

export function convertJsonLogicToBlocklyBocks(jsonLogic: JsonLogicRules): BlocklyBlock[] {
  console.log({ jsonLogic })

  return []
}
