import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/solid"
import { IStatuteData } from "./statutes"

interface LawDisplayProps {
  selectedLaw: IStatuteData
}

export default function LawDisplay({ selectedLaw }: LawDisplayProps) {
  console.log({ selectedLaw })
  return (
    <div className="p-4">
      <div className="flex gap-1">
        <h1 className="text-xl font-bold">{selectedLaw.title}</h1>
        <a href={selectedLaw.url} target="_blank" rel="noopener noreferrer">
          <ArrowTopRightOnSquareIcon className="size-6 text-blue-600 hover:text-blue-800 visited:text-purple-600" />
        </a>
      </div>
      <p className="">{selectedLaw.text}</p>
      {/* <ScrollArea className="h-96 w-full">
      </ScrollArea> */}
    </div>
  )
}
