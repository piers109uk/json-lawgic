export interface IJsonLogicInterpretation {
  // The pure JSON logic rule expressed as a JSON object
  rule: object
  // three examples of data that we could run the JsonLogic rule on
  examples: object[]
  // a list of variables referenced in the rule
  variables: string[]
}

export interface IStatuteData {
  id: string
  url: string
  title: string | null
  /** section content */
  text: string | null
}

export const statutes: IStatuteData[] = [
  {
    id: "1.03",
    url: "https://www.revisor.mn.gov/statutes/cite/1.03",
    title: "1.03 WATERS INCLUDED.",
    text: "The concurrent jurisdiction of a county and of courts and officers exercising jurisdiction throughout it extends over the water area that would be included if the boundary lines of the county were produced in the direction of their approach and extended across the waters to the opposite shore.",
  },
  {
    id: "1.01",
    url: "https://www.revisor.mn.gov/statutes/cite/1.01",
    title: "1.01 EXTENT.",
    text: "The sovereignty and jurisdiction of this state extend to all places within its boundaries as defined in the constitution and, concurrently, to the waters forming a common boundary between this and adjoining states, subject only to rights of jurisdiction acquired by the United States over places in it.",
  },
]
