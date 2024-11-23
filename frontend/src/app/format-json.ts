import { Formatter } from "fracturedjsonjs"

const formatter = new Formatter()

export function stringifyJson(json?: object) {
  if (!json) return ""

  const formattedJson = formatter.Serialize(json) ?? ""
  return formattedJson
}
