"use client"

import { useState } from "react"
import JsonLogic from "./json-logic"
import Search from "./Search"
import { IStatuteData, showcase, statutes } from "./statutes"
import LawDisplay from "./law-display"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScaleIcon } from "@heroicons/react/24/solid"

// TODO: reducer?
// TODO: Move to provider

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
      <div className="h-screen bg-background">
        <header className="bg-primary text-primary-foreground p-4 flex gap-1 items-center">
          <ScaleIcon className="size-6" />
          <h1 className="text-2xl font-bold">Json-Lawgic</h1>
        </header>
        <Tabs defaultValue="search" className="">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="showcase">Showcase</TabsTrigger>
          </TabsList>
          <TabsContent value="search" className="flex-grow flex">
            <div className="flex">
              <div className="w-1/3 p-4 bg-white shadow-md">
                <Search statutes={statutes} setSelectedLaw={setSelectedLaw}></Search>
              </div>
              <div className="w-2/3 p-4 overflow-auto">
                <LawDisplay selectedLaw={selectedLaw}></LawDisplay>
                <JsonLogic interpretation={selectedLaw} setRule={setRule} setData={setData}></JsonLogic>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="showcase" className="flex-grow flex">
            <div className="flex">
              <div className="w-1/3 p-4 bg-white shadow-md">
                <Search statutes={showcase} setSelectedLaw={setSelectedLaw}></Search>
              </div>
              <div className="w-2/3 p-4 overflow-auto">
                <LawDisplay selectedLaw={selectedLaw}></LawDisplay>
                <JsonLogic interpretation={selectedLaw} setRule={setRule} setData={setData}></JsonLogic>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
