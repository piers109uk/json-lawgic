"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScaleIcon } from "@heroicons/react/24/solid"
import { useState } from "react"
import LawDisplay from "./law-display"
import LawRules from "./law-rules"
import LawsList from "./laws-list"
import Search from "./Search"
import { IStatuteData, showcase, statutes } from "./statutes"

// TODO: reducer?
// TODO: Move to provider

export default function Home() {
  const [selectedLaw, setSelectedLaw] = useState<IStatuteData>(statutes[0])

  // TODO: determine how to display multiple rules

  return (
    <>
      <div className="h-screen bg-background">
        <header className="bg-primary text-primary-foreground p-4 flex gap-1 items-center">
          <ScaleIcon className="size-6" />
          <h1 className="text-2xl font-bold">JsonLawgic</h1>
        </header>
        <Tabs defaultValue="search" className="">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="showcase">Showcase</TabsTrigger>
          </TabsList>
          <TabsContent value="search" className="flex-grow flex">
            <div className="flex">
              <div className="w-1/3 p-4 bg-white shadow-md">
                <Search statutes={statutes} onLawClick={setSelectedLaw}></Search>
              </div>
              <div className="w-2/3 p-4 overflow-auto">
                <LawDisplay selectedLaw={selectedLaw}></LawDisplay>
                <LawRules rules={selectedLaw.rules}></LawRules>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="showcase" className="flex-grow flex">
            <div className="flex">
              <div className="w-1/3 p-4 bg-white shadow-md">
                <LawsList laws={showcase} onLawClick={setSelectedLaw} />
              </div>
              <div className="w-2/3 p-4 overflow-auto">
                <LawDisplay selectedLaw={selectedLaw}></LawDisplay>
                <LawRules rules={selectedLaw.rules}></LawRules>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
