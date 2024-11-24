import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { IStatuteData } from "./statutes"

export interface LawsListProps {
  laws: IStatuteData[]
  onLawClick: React.Dispatch<React.SetStateAction<IStatuteData>>
}

export default function LawsList({ laws, onLawClick }: LawsListProps) {
  return (
    <ScrollArea className="lg:h-[calc(100vh-200px)]">
      {laws.map((law) => (
        <Button key={law.id} variant="ghost" className="w-full justify-start mb-2 text-left" onClick={() => onLawClick(law)}>
          {law.title}
        </Button>
      ))}
    </ScrollArea>
  )
}
