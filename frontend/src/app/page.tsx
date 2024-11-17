import BlocklyWrapper from "./blockly-wrapper"
import JsonLogic from "./json-logic"

export default function Home() {
  return (
    <>
      <div className="flex h-screen">
        <div className="flex-[3] p-4">
          <BlocklyWrapper />
        </div>
        <div className="flex-[1] p-4">
          <JsonLogic></JsonLogic>
        </div>
      </div>
    </>
  )
}
