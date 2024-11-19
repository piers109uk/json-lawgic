import { Blocks, FieldTextInput } from "blockly"

export function registerCustomBlocks() {
  Blocks["new_boundary_function"] = {
    init: function () {
      this.appendDummyInput().appendField(new FieldTextInput("Boundary Function Name"), "Name")
      this.appendStatementInput("Content").setCheck(null)
      this.setInputsInline(true)
      this.setColour(315)
      this.setTooltip("")
      this.setHelpUrl("")
    },
  }
}
