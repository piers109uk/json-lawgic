"use client"

import { useState } from "react"
import JsonLogic from "./json-logic"
import Search from "./Search"
import { IStatuteData, statutes } from "./statutes"
import LawDisplay from "./law-display"

// TODO: reducer

export default function Home() {
  const [selectedLaw, setSelectedLaw] = useState<IStatuteData>(statutes[0])

  const setRule = (rule: object) => {
    console.log("setRule", rule)
    setSelectedLaw((prevState) => ({ ...prevState, rule }))
  }

  const setData = (data: object | object[]) => {
    console.log("setData", data)
    const examples = Array.isArray(data) ? data : [data]
    setSelectedLaw((prevState) => ({ ...prevState, examples }))
  }

  return (
    <>
      <div className="flex h-screen">
        <div className="flex-1 p-4">
          <Search statutes={statutes} setSelectedLaw={setSelectedLaw}></Search>
        </div>
        <div className="flex-1 p-4">
          <LawDisplay selectedLaw={selectedLaw}></LawDisplay>
          <JsonLogic data={selectedLaw.examples} rule={selectedLaw.rule} setRule={setRule} setData={setData}></JsonLogic>
        </div>
      </div>
    </>
  )
}
