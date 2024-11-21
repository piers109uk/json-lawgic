import { ScrollArea } from "@/components/ui/scroll-area"
import { IStatuteData } from "./statutes"
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/solid"

interface LawDisplayProps {
  selectedLaw: IStatuteData
}

export default function LawDisplay({ selectedLaw }: LawDisplayProps) {
  return (
    <div className="p-4">
      <div className="flex gap-1">
        <h1 className="text-xl font-bold">{selectedLaw.title}</h1>
        <a href={selectedLaw.url}>
          <ArrowTopRightOnSquareIcon className="size-6 text-blue-600 hover:text-blue-800 visited:text-purple-600" />
        </a>
      </div>
      <p className="">{selectedLaw.text}</p>
      {/* <ScrollArea className="h-96 w-full">
      </ScrollArea> */}
      {/* <p>{selectedLaw.text}</p> */}
    </div>
  )
}
