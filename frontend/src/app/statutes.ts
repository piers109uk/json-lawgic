import interpretedLaws from "../../public/interpreted-laws.json"

export interface IJsonLogicInterpretation {
  // The pure JSON logic rule expressed as a JSON object
  rule: object
  // three examples of data that we could run the JsonLogic rule on
  examples: object[]
  // a list of variables referenced in the rule
  variables: string[]
}

export interface IStatuteData extends Partial<IJsonLogicInterpretation> {
  id: string
  url: string
  title: string | null
  /** section content */
  text: string | null
}

export const statutes: IStatuteData[] = interpretedLaws

// export async function fetchStatutes() {
//   const response = await fetch("https://github.com/piers109uk/json-lawgic/blob/main/data/interpreted-laws.json")
//   const data = await response.json()
//   return data as IStatuteData[]
// }
