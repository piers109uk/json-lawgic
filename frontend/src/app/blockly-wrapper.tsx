"use client"
import { useRef, useState } from "react"
import { BlocklyWorkspace } from "react-blockly"

export default function BlocklyWrapper() {
  const [json, setJson] = useState<object>()
  const toolbox = {
    // There are two kinds of toolboxes. The simpler one is a flyout toolbox.
    kind: "flyoutToolbox",
    // The contents is the blocks and other items that exist in your toolbox.
    contents: [
      { kind: "block", type: "controls_if" },
      { kind: "block", type: "controls_whileUntil" },
      { kind: "block", type: "logic_compare" },
      { kind: "block", type: "math_number" },
    ],
  }

  return (
    <BlocklyWorkspace
      className="w-full h-full"
      toolboxConfiguration={toolbox} // this must be a JSON toolbox definition
      initialJson={json}
      onJsonChange={setJson}
    ></BlocklyWorkspace>
  )
}

// const workspace = Blockly.inject(blocklyDiv.current.id, {
//   toolbox: {
//     kind: "flyoutToolbox",
//     contents: [
//       { kind: "block", type: "controls_if" },
//       { kind: "block", type: "logic_compare" },
//       { kind: "block", type: "math_number" },
//       { kind: "block", type: "text" },
//     ],
//   },
// })
