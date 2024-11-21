import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import MiniSearch, { SearchResult } from "minisearch"
import { useEffect, useState } from "react"
import { IStatuteData, statutes } from "./statutes"

// TODO: include text in search

const miniSearch = new MiniSearch<IStatuteData>({
  fields: ["title"], // fields to index for full-text search
  storeFields: ["id", "url", "title", "text"], // fields to return with search results
  searchOptions: { fuzzy: true, prefix: true, boost: { title: 2 } },
})

miniSearch.addAll(statutes)

interface SearchWidgetProps {
  statutes: IStatuteData[]
  setSelectedLaw: React.Dispatch<React.SetStateAction<IStatuteData>>
}

export default function Search({ statutes, setSelectedLaw }: SearchWidgetProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<IStatuteData[]>(statutes)
  // const [selectedLaw, setSelectedLaw] = useState<IStatuteData>(statutes[0])

  useEffect(() => {
    console.log("Search effect query", query)
    if (query) {
      const searchResults = miniSearch.search(query) as (IStatuteData & SearchResult)[]
      setResults(searchResults)
    } else {
      setResults(statutes)
    }
  }, [query, statutes])

  return (
    <div>
      <Input type="text" placeholder="Search laws.." value={query} onChange={(e) => setQuery(e.target.value)} className="w-full p-2 border rounded" />

      <ScrollArea className="h-[calc(100vh-140px)]">
        {results.map((law) => (
          <Button key={law.id} variant="ghost" className="w-full justify-start mb-2 text-left" onClick={() => setSelectedLaw(law)}>
            {law.title}
          </Button>
        ))}
      </ScrollArea>
    </div>
  )
}
