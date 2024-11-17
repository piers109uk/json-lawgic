"use client"
import jsonLogic from "json-logic-js"
import { useState } from "react"
import { convertJsonLogicToBlockly } from "./json-to-blockly"

export default function JsonLogic() {
  const [rule, setRule] = useState<string>("")
  const [data, setData] = useState<string>("")
  const [result, setResult] = useState<any>(null)

  const handleApplyLogic = () => {
    const { parsedRule, parsedData } = parseJson({ rule, data })
    convertToBlockly(parsedRule)
    const result = calculateResult(rule, data)
    setResult(result)
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">JSON Logic Evaluator</h1>
      <div className="mb-4">
        <textarea
          className="w-full p-2 border border-gray-300 rounded text-sm"
          placeholder="Enter JSON Logic Rule"
          value={rule}
          onChange={(e) => setRule(e.target.value)}
          rows={10}
        />
      </div>
      <div className="mb-4">
        <textarea
          className="w-full p-2 border border-gray-300 rounded text-sm"
          placeholder="Enter Data"
          value={data}
          onChange={(e) => setData(e.target.value)}
          rows={10}
        />
      </div>
      <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" onClick={handleApplyLogic}>
        Apply Logic
      </button>
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
function calculateResult(rule: string, data: string) {
  try {
    const { parsedRule, parsedData } = parseJson({ rule, data })

    if (Array.isArray(parsedData)) return parsedData.map((item) => jsonLogic.apply(parsedRule, item))
    else return jsonLogic.apply(parsedRule, parsedData)
  } catch (error: any) {
    console.error(error)
    return `Invalid JSON: ${error.message}`
  }
}

function convertToBlockly(rule: object) {
  const blockly = convertJsonLogicToBlockly(rule)
  console.log({ blockly })
}
