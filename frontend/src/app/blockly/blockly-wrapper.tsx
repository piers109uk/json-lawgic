"use client"
import * as Blockly from "blockly/core"
import { useState } from "react"
import { BlocklyWorkspace } from "react-blockly"
import { registerCustomBlocks } from "./custom-blocks"
registerCustomBlocks()

export default function BlocklyWrapper() {
  const [json, setJson] = useState<object>()

  const logicCategory = {
    kind: "category",
    name: "Logic",
    colour: "#FFA500",
    contents: [
      { kind: "block", type: "logic_boolean" },
      { kind: "block", type: "controls_if" },
      { kind: "block", type: "controls_ifelse" },
      { kind: "block", type: "logic_compare" },
      { kind: "block", type: "logic_operation" },
      { kind: "block", type: "logic_negate" },
      { kind: "block", type: "logic_null" },
      { kind: "block", type: "logic_ternary" },
      { kind: "block", type: "controls_if_if" },
      { kind: "block", type: "controls_if_elseif" },
      { kind: "block", type: "controls_if_else" },
    ],
  }

  const variablesCategory = {
    kind: "category",
    name: "Variables",
    colour: "#FFA500",
    contents: [
      { kind: "block", type: "variables_get" },
      { kind: "block", type: "variables_set" },
    ],
  }

  const dynamicVariablesCategory = {
    kind: "category",
    name: "Dynamic Variables",
    colour: "#FFA500",
    contents: [
      { kind: "block", type: "variables_get_dynamic" },
      { kind: "block", type: "variables_set_dynamic" },
    ],
  }

  const mathCategory = {
    kind: "category",
    name: "Math",
    colour: "#FFA500",
    contents: [
      { kind: "block", type: "math_number" },
      { kind: "block", type: "math_arithmetic" },
      { kind: "block", type: "math_single" },
      { kind: "block", type: "math_trig" },
      { kind: "block", type: "math_constant" },
      { kind: "block", type: "math_number_property" },
      { kind: "block", type: "math_change" },
      { kind: "block", type: "math_round" },
      { kind: "block", type: "math_on_list" },
      { kind: "block", type: "math_modulo" },
      { kind: "block", type: "math_constrain" },
      { kind: "block", type: "math_random_int" },
      { kind: "block", type: "math_random_float" },
      { kind: "block", type: "math_atan2" },
    ],
  }

  const listCategory = {
    kind: "category",
    name: "Lists",
    colour: "#FFA500",
    contents: [
      { kind: "block", type: "lists_create_empty" },
      { kind: "block", type: "lists_repeat" },
      { kind: "block", type: "lists_reverse" },
      { kind: "block", type: "lists_isEmpty" },
      { kind: "block", type: "lists_length" },
    ],
  }

  const textCategory = {
    kind: "category",
    name: "Text",
    colour: "#FFA500",
    contents: [
      { kind: "block", type: "text" },
      { kind: "block", type: "text_join" },
      { kind: "block", type: "text_append" },
      { kind: "block", type: "text_length" },
      { kind: "block", type: "text_isEmpty" },
      { kind: "block", type: "text_indexOf" },
      { kind: "block", type: "text_charAt" },
      { kind: "block", type: "text_getSubstring" },
      { kind: "block", type: "text_changeCase" },
      { kind: "block", type: "text_trim" },
      { kind: "block", type: "text_print" },

      // { kind: "block", type: "text" },
      // { kind: "block", type: "text_join" },
      // { kind: "block", type: "text_create_join_container" },
      // { kind: "block", type: "text_create_join_item" },
      // { kind: "block", type: "text_append" },
      // { kind: "block", type: "text_length" },
      // { kind: "block", type: "text_isEmpty" },
      // { kind: "block", type: "text_indexOf" },
      // { kind: "block", type: "text_charAt" },
    ],
  }

  const customBlocksCategory = {
    kind: "category",
    name: "Custom Blocks",
    colour: "#FFA500",
    contents: [{ kind: "block", type: "new_boundary_function" }],
  }

  const toolbox: Blockly.utils.toolbox.ToolboxDefinition = {
    // There are two kinds of toolboxes. The simpler one is a flyout toolbox.
    kind: "categoryToolbox",
    // The contents is the blocks and other items that exist in your toolbox.
    contents: [logicCategory, dynamicVariablesCategory, variablesCategory, mathCategory, listCategory, textCategory, customBlocksCategory],
  }

  return (
    <BlocklyWorkspace
      className="w-full h-full"
      workspaceConfiguration={{}}
      toolboxConfiguration={toolbox} // this must be a JSON toolbox definition
      initialJson={json}
      onJsonChange={setJson}
    ></BlocklyWorkspace>
  )
}

// logic_boolean
// controls_if
// controls_ifelse
// logic_compare
// logic_operation
// logic_negate
// logic_null
// logic_ternary
// controls_if_if
// controls_if_elseif
// controls_if_else
