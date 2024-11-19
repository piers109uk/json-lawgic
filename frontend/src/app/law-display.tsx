import { IStatuteData } from "./statutes"

interface LawDisplayProps {
  selectedLaw: IStatuteData
}

export default function LawDisplay({ selectedLaw }: LawDisplayProps) {
  return (
    <div className="w-2/3 p-4">
      <h1 className="text-xl font-bold">{selectedLaw.title}</h1>
      <p>{selectedLaw.text}</p>
    </div>
  )
}
