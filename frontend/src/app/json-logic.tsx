import jsonLogic from "json-logic-js"
import { useState } from "react"
import { stringifyJson } from "./format-json"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

type JsonLogicResult = boolean | boolean[] | string

export interface JsonLogicProps {
  rule?: object
  data?: object | object[]
  setRule: (rule: object) => void
  setData: (data: object | object[]) => void
}

/**
 * TODO: input/output the rules & data
 */

export default function JsonLogic({ rule, data, setRule, setData }: JsonLogicProps) {
  const [result, setResult] = useState<JsonLogicResult | null>(null)

  const ruleString = stringifyJson(rule)
  const dataString = stringifyJson(data)

  const onRuleChange = (v: string) => {
    console.log("onRuleChange", v)
    try {
      setRule(JSON.parse(v))
    } catch (error: any) {
      console.error(error)
      setResult(`Invalid Rule: ${error.message}`)
    }
  }

  const onDataChange = (v: string) => {
    console.log("onDataChange", v)
    try {
      setData(JSON.parse(v))
    } catch (error: any) {
      console.error(error)
      setResult(`Invalid Data: ${error.message}`)
    }
  }

  const handleApplyLogic = (rule: string, data: string) => {
    const result = calculateResult(rule, data)
    setResult(result)
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">JSON Logic Evaluator</h1>
      <div className="mb-4">
        <label htmlFor="rule" className="block text-sm font-medium text-gray-700 mb-1">
          Rule
        </label>
        <Textarea id="rule" value={ruleString} onChange={(e) => onRuleChange(e.target.value)} rows={10} className="font-mono" />
      </div>

      <div className="mb-4">
        <label htmlFor="examples" className="block text-sm font-medium text-gray-700 mb-1">
          Examples
        </label>
        <Textarea id="examples" value={dataString} onChange={(e) => onDataChange(e.target.value)} rows={10} className="font-mono" />
      </div>

      <Button onClick={() => handleApplyLogic(ruleString, dataString)} className="rounded-full">
        Apply Logic
      </Button>

      <div className="mt-4">
        <h2 className="text-xl font-bold">Result:</h2>
        <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap break-words">{JSON.stringify(result, null, 2)}</pre>
      </div>
    </>
  )
}

function parseJson({ rule, data }: { rule: string; data: string }) {
  const parsedRule = JSON.parse(rule)
  const parsedData = JSON.parse(data)
  return { parsedRule, parsedData }
}

/** parse rule & date, then apply logic */
function calculateResult(rule: string, data: string): JsonLogicResult {
  try {
    const { parsedRule, parsedData } = parseJson({ rule, data })

    if (Array.isArray(parsedData)) return parsedData.map((item) => jsonLogic.apply(parsedRule, item))
    else return jsonLogic.apply(parsedRule, parsedData)
  } catch (error: any) {
    console.error(error)
    return `Invalid JSON: ${error.message}`
  }
}
