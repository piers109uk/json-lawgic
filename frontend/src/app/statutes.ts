import interpretedLaws from "../../public/interpreted-laws.json"
import showcaseLaws from "../../public/showcase-laws.json"

export interface RuleVariable {
  name: string
  description: string
}

export interface JsonLogicInterpretation {
  // The pure JSON logic rule expressed as a JSON object
  rule: object
  // three examples of data that we could run the JsonLogic rule on
  examples: object[]
  // a list of variables referenced in the rule
  variables: RuleVariable[]
  // The consequences IF the rule evaluates to true, expressed as briefly as possible
  consequences: string[]
}

export interface IStatuteData extends Partial<JsonLogicInterpretation> {
  id: string
  url: string
  title: string | null
  /** section content */
  text: string | null
}

export const statutes: IStatuteData[] = interpretedLaws

export const showcase: IStatuteData[] = showcaseLaws

// export async function fetchStatutes() {
//   const response = await fetch("https://github.com/piers109uk/json-lawgic/blob/main/data/interpreted-laws.json")
//   const data = await response.json()
//   return data as IStatuteData[]
// }
