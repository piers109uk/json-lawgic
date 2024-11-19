"use client"

import { useState } from "react"
import JsonLogic from "./json-logic"
import Search from "./Search"
import { IStatuteData, statutes } from "./statutes"
import LawDisplay from "./law-display"

export default function Home() {
  const [selectedLaw, setSelectedLaw] = useState<IStatuteData>(statutes[0])
  return (
    <>
      <div className="flex h-screen">
        <div className="flex-1 p-4">
          <Search statutes={statutes} setSelectedLaw={setSelectedLaw}></Search>
        </div>
        <div className="flex-1 p-4">
          <LawDisplay selectedLaw={selectedLaw}></LawDisplay>
          <JsonLogic></JsonLogic>
        </div>
      </div>
    </>
  )
}
