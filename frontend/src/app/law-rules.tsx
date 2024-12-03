import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import JsonLogic from "./json-logic"
import { JsonLogicInterpretation } from "./statutes"

export interface LawRulesProps {
  rules: JsonLogicInterpretation[]
}

export default function LawRules(props: LawRulesProps) {
  const { rules } = props
  return rules.length === 1 ? (
    <JsonLogic interpretation={rules[0]}></JsonLogic>
  ) : (
    <>
      <Tabs defaultValue="0">
        <TabsList className="">
          {rules.map((_, idx) => (
            <TabsTrigger key={idx} value={idx.toString()}>
              Rule {idx + 1}
            </TabsTrigger>
          ))}
        </TabsList>
        {rules.map((r, idx) => (
          <TabsContent value={idx.toString()} className="" key={idx}>
            <JsonLogic key={idx} interpretation={r}></JsonLogic>
          </TabsContent>
        ))}
      </Tabs>
    </>
  )
}
