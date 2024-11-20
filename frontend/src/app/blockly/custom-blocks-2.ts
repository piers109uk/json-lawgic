// import { Blocks, FieldTextInput, selectionArrow } from "blockly"

// Blockly.selectionArrow = function () {
//   return Blockly.RTL ? "←" : "→"
// }
// Blockly.keyValueArrow = function () {
//   return Blockly.RTL ? "⇐" : "⇒"
// }

// //==========================================================================================================

// function appendElementInput(that) {
//   var lastIndex = that.length++

//   var appended_input = that.appendValueInput("element_" + lastIndex)
//   appended_input
//     .appendField(
//       new Blockly.FieldTextbutton("–", function () {
//         that.deleteElementInput(appended_input)
//       })
//     )
//     .appendSelector(
//       [
//         "var",
//         "dictionary",
//         "array",
//         "number",
//         "string",
//         "true_false",
//         "if_logic",
//         "logical",
//         "not",
//         "boolean",
//         "comparison",
//         "minmax",
//         "between",
//         "arithmatic",
//         "map_filter",
//         "merge",
//         "InMiss",
//         "inString",
//         "catString",
//         "subStr",
//       ],
//       Blockly.selectionArrow(),
//       "null"
//     )

//   that.moveInputBefore("element_" + lastIndex)

//   return appended_input
// }

// function deleteElementInput(inputToDelete, that) {
//   var inputNameToDelete = inputToDelete.name

//   var substructure = that.getInputTargetBlock(inputNameToDelete)
//   if (substructure) {
//     substructure.dispose(true, true)
//   }
//   that.removeInput(inputNameToDelete)

//   var inputIndexToDelete = parseInt(inputToDelete.name.match(/\d+/)[0])

//   var lastIndex = --that.length

//   for (var i = inputIndexToDelete + 1; i <= lastIndex; i++) {
//     // rename all the subsequent element-inputs
//     var input = that.getInput("element_" + i)

//     input.name = "element_" + (i - 1)
//   }
// }

// //================================================================================================================

// Blockly.Blocks["start"] = {
//   init: function () {
//     this.setColour(250)
//     this.appendDummyInput().setAlign(Blockly.ALIGN_CENTRE).appendField("JsonLogic")

//     this.appendValueInput("json").appendSelector(
//       [
//         "var",
//         "dictionary",
//         "array",
//         "number",
//         "string",
//         "true_false",
//         "if_logic",
//         "logical",
//         "not",
//         "boolean",
//         "comparison",
//         "minmax",
//         "between",
//         "arithmatic",
//         "map_filter",
//         "merge",
//         "InMiss",
//         "inString",
//         "catString",
//         "subStr",
//       ],
//       Blockly.selectionArrow(),
//       "null"
//     )

//     this.setDeletable(false)
//   },
// }

// //-------------------------------------------------------------------------------------------------------
// Blockly.Blocks["true_false"] = {
//   init: function () {
//     this.appendDummyInput().appendField(
//       new Blockly.FieldDropdown([
//         ["true", "true"],
//         ["false", "false"],
//       ]),
//       "bool"
//     )
//     this.setOutput(true, ["element"])
//     this.setColour(210)
//   },
// }

// //-------------------------------------------------------------------------------------------------------

// Blockly.Blocks["string"] = {
//   init: function () {
//     this.setColour(190)
//     this.setOutput(true, ["element"])

//     this.appendDummyInput()
//       .setAlign(Blockly.ALIGN_CENTRE)
//       .appendField(" string ")
//       .appendField('"')
//       .appendField(new Blockly.FieldTextInput(""), "string_value")
//       .appendField('"')
//   },
// }

// //-------------------------------------------------------------------------------------------------------
// Blockly.Blocks["number"] = {
//   init: function () {
//     this.setColour(210)
//     this.setOutput(true, ["element"])

//     this.appendDummyInput()
//       .setAlign(Blockly.ALIGN_CENTRE)
//       .appendField("number")
//       .appendField(new Blockly.FieldTextInput("0", Blockly.FieldTextInput.numberValidator), "number_value")
//   },
// }
// //-------------------------------------------------------------------------------------------------------

// Blockly.Blocks["dictionary"] = {
//   length: 0,
//   init: function () {
//     this.setColour(120)
//     this.setOutput(true, ["element"])

//     this.appendDummyInput("open_bracket")
//       .appendField(" dictionary ")
//       .appendField(
//         new Blockly.FieldTextbutton("+", function () {
//           this.sourceBlock_.appendKeyValuePairInput()
//         })
//       )

//     this.setInputsInline(false)
//   },

//   appendKeyValuePairInput: function () {
//     var lastIndex = this.length++

//     var appended_input = this.appendValueInput("element_" + lastIndex)
//     appended_input
//       .appendField(
//         new Blockly.FieldTextbutton("–", function () {
//           this.sourceBlock_.deleteKeyValuePairInput(appended_input)
//         })
//       )
//       .appendField(new Blockly.FieldTextInput("key_" + lastIndex), "key_field_" + lastIndex)
//       .appendField(Blockly.keyValueArrow())
//       .appendSelector(
//         [
//           "var",
//           "dictionary",
//           "array",
//           "number",
//           "string",
//           "true_false",
//           "if_logic",
//           "logical",
//           "not",
//           "boolean",
//           "comparison",
//           "minmax",
//           "between",
//           "arithmatic",
//           "map_filter",
//           "merge",
//           "InMiss",
//           "inString",
//           "catString",
//           "subStr",
//         ],
//         Blockly.selectionArrow(),
//         "null"
//       )

//     this.moveInputBefore("element_" + lastIndex)

//     return appended_input
//   },

//   deleteKeyValuePairInput: function (inputToDelete) {
//     var inputNameToDelete = inputToDelete.name

//     var substructure = this.getInputTargetBlock(inputNameToDelete)
//     if (substructure) {
//       substructure.dispose(true, true)
//     }
//     this.removeInput(inputNameToDelete)

//     var inputIndexToDelete = parseInt(inputToDelete.name.match(/\d+/)[0])

//     var lastIndex = --this.length

//     for (var i = inputIndexToDelete + 1; i <= lastIndex; i++) {
//       // rename all the subsequent element-inputs
//       var input = this.getInput("element_" + i)
//       input.name = "element_" + (i - 1)

//       var key_field = this.getField_("key_field_" + i)
//       key_field.name = "key_field_" + (i - 1)
//     }
//   },
// }

// //---------------------------------------------------------------------------------------------------------

// Blockly.Blocks["array"] = {
//   length: 0,
//   init: function () {
//     this.setColour(350)
//     this.setOutput(true, ["element"])

//     this.appendDummyInput("open_bracket")
//       .appendField(" Array ")
//       .appendField(
//         new Blockly.FieldTextbutton("+", function () {
//           this.sourceBlock_.appendElementInput()
//         })
//       )

//     this.setInputsInline(false)
//   },
//   appendElementInput: function () {
//     appendElementInput(this)
//   },
//   deleteElementInput: function (inputToDelete) {
//     deleteElementInput(inputToDelete, this)
//   },
// }

// //-------------------------------------------------------------------------------------------------------

// Blockly.Blocks["var"] = {
//   length: 0,
//   init: function () {
//     this.setColour(130)
//     this.setOutput(true, ["element"])

//     this.appendValueInput("json0")
//       .appendField(" var ")
//       .appendSelector(
//         [
//           "var",
//           "dictionary",
//           "array",
//           "number",
//           "string",
//           "true_false",
//           "if_logic",
//           "logical",
//           "not",
//           "boolean",
//           "comparison",
//           "minmax",
//           "between",
//           "arithmatic",
//           "map_filter",
//           "merge",
//           "InMiss",
//           "inString",
//           "catString",
//           "subStr",
//         ],
//         Blockly.selectionArrow(),
//         "null"
//       )
//     this.setInputsInline(false)
//   },
// }

// //-------------------------------------------------------------------------------------------------------

// Blockly.Blocks["if_logic"] = {
//   length: 0,
//   init: function () {
//     this.setColour(330)
//     this.setOutput(true, ["element"])

//     this.appendDummyInput("if")
//       .appendField(" if ")
//       .appendField(
//         new Blockly.FieldTextbutton("+", function () {
//           this.sourceBlock_.appendElementInput()
//         })
//       )
//     this.setInputsInline(false)
//   },
//   appendElementInput: function () {
//     appendElementInput(this)
//   },
//   deleteElementInput: function (inputToDelete) {
//     deleteElementInput(inputToDelete, this)
//   },
// }

// //-------------------------------------------------------------------------------------------------------

// Blockly.Blocks["logical"] = {
//   init: function () {
//     var options = [
//       ["!=", "!="],
//       [" === ", "==="],
//       [" == ", "=="],
//       [" !== ", "!=="],
//     ]

//     this.appendValueInput("json0")
//       .appendField(" Logical ")
//       .appendSelector(
//         [
//           "var",
//           "dictionary",
//           "array",
//           "number",
//           "string",
//           "true_false",
//           "if_logic",
//           "logical",
//           "not",
//           "boolean",
//           "comparison",
//           "minmax",
//           "between",
//           "arithmatic",
//           "map_filter",
//           "merge",
//           "InMiss",
//           "inString",
//           "catString",
//           "subStr",
//         ],
//         Blockly.selectionArrow(),
//         "null"
//       )
//     this.appendValueInput("json1")
//       .appendField(new Blockly.FieldDropdown(options), "operator")
//       .appendSelector(
//         [
//           "var",
//           "dictionary",
//           "array",
//           "number",
//           "string",
//           "true_false",
//           "if_logic",
//           "logical",
//           "not",
//           "boolean",
//           "comparison",
//           "minmax",
//           "between",
//           "arithmatic",
//           "map_filter",
//           "merge",
//           "InMiss",
//           "inString",
//           "catString",
//           "subStr",
//         ],
//         Blockly.selectionArrow(),
//         "null"
//       )

//     this.setInputsInline(true)
//     this.setOutput(true, ["element"])
//     this.setColour(210)
//   },
// }

// //-------------------------------------------------------------------------------------------------------

// Blockly.Blocks["not"] = {
//   length: 0,
//   init: function () {
//     this.setColour(160)
//     this.setOutput(true, ["element"])
//     var options = [
//       ["!", "!"],
//       ["!!", "!!"],
//     ]

//     this.appendValueInput("json0")
//       .appendField(" NOT ")
//       .appendField(new Blockly.FieldDropdown(options), "operator")
//       .appendSelector(
//         [
//           "var",
//           "dictionary",
//           "array",
//           "number",
//           "string",
//           "true_false",
//           "if_logic",
//           "logical",
//           "not",
//           "boolean",
//           "comparison",
//           "minmax",
//           "between",
//           "arithmatic",
//           "map_filter",
//           "merge",
//           "InMiss",
//           "inString",
//           "catString",
//           "subStr",
//         ],
//         Blockly.selectionArrow(),
//         "null"
//       )
//     this.setInputsInline(false)
//   },
// }

// //-------------------------------------------------------------------------------------------------------

// Blockly.Blocks["boolean"] = {
//   length: 0,
//   init: function () {
//     this.setColour(330)
//     this.setOutput(true, ["element"])
//     var options = [
//       ["and", "and"],
//       [" or ", "or"],
//     ]

//     this.appendDummyInput("boolean")
//       .appendField(" boolean ")
//       .appendField(new Blockly.FieldDropdown(options), "operator")
//       .appendField(
//         new Blockly.FieldTextbutton("+", function () {
//           this.sourceBlock_.appendElementInput()
//         })
//       )
//     this.setInputsInline(false)
//   },
//   appendElementInput: function () {
//     appendElementInput(this)
//   },
//   deleteElementInput: function (inputToDelete) {
//     deleteElementInput(inputToDelete, this)
//   },
// }

// //-------------------------------------------------------------------------------------------------------

// Blockly.Blocks["comparison"] = {
//   length: 0,
//   init: function () {
//     this.setColour(160)
//     this.setOutput(true, ["element"])
//     var options = [
//       [">", ">"],
//       [" >= ", ">="],
//       [" < ", "<"],
//       [" <= ", "<="],
//     ]

//     this.appendValueInput("json0")
//       .appendField(" comparison ")
//       .appendSelector(
//         [
//           "var",
//           "dictionary",
//           "array",
//           "number",
//           "string",
//           "true_false",
//           "if_logic",
//           "logical",
//           "not",
//           "boolean",
//           "comparison",
//           "minmax",
//           "between",
//           "arithmatic",
//           "map_filter",
//           "merge",
//           "InMiss",
//           "inString",
//           "catString",
//           "subStr",
//         ],
//         Blockly.selectionArrow(),
//         "null"
//       )
//     this.appendValueInput("json1")
//       .appendField(new Blockly.FieldDropdown(options), "operator")
//       .appendSelector(
//         [
//           "var",
//           "dictionary",
//           "array",
//           "number",
//           "string",
//           "true_false",
//           "if_logic",
//           "logical",
//           "not",
//           "boolean",
//           "comparison",
//           "minmax",
//           "between",
//           "arithmatic",
//           "map_filter",
//           "merge",
//           "InMiss",
//           "inString",
//           "catString",
//           "subStr",
//         ],
//         Blockly.selectionArrow(),
//         "null"
//       )

//     this.setInputsInline(true)
//   },
// }

// //-------------------------------------------------------------------------------------------------------

// Blockly.Blocks["minmax"] = {
//   length: 0,
//   init: function () {
//     this.setColour(270)
//     this.setOutput(true, ["element"])
//     var options = [
//       ["min", "min"],
//       [" max ", "max"],
//     ]

//     this.appendDummyInput("minmax")
//       .appendField(" MinMax ")
//       .appendField(new Blockly.FieldDropdown(options), "operator")
//       .appendField(
//         new Blockly.FieldTextbutton("+", function () {
//           this.sourceBlock_.appendElementInput()
//         })
//       )
//       .appendField(" ")
//     this.setInputsInline(true)
//   },
//   appendElementInput: function () {
//     appendElementInput(this)
//   },
//   deleteElementInput: function (inputToDelete) {
//     deleteElementInput(inputToDelete, this)
//   },
// }

// //-------------------------------------------------------------------------------------------------------------

// Blockly.Blocks["between"] = {
//   length: 0,
//   init: function () {
//     this.setColour(290)
//     this.setOutput(true, ["element"])
//     var options = [
//       ["<=", "<="],
//       [" < ", "<"],
//     ]

//     this.appendDummyInput("between").appendField(" Between ").appendField(new Blockly.FieldDropdown(options), "operator").appendField("  ")
//     this.appendValueInput("json0").appendSelector(
//       [
//         "var",
//         "dictionary",
//         "array",
//         "number",
//         "string",
//         "true_false",
//         "if_logic",
//         "logical",
//         "not",
//         "boolean",
//         "comparison",
//         "minmax",
//         "between",
//         "arithmatic",
//         "map_filter",
//         "merge",
//         "InMiss",
//         "inString",
//         "catString",
//         "subStr",
//       ],
//       Blockly.selectionArrow(),
//       "null"
//     )
//     this.appendValueInput("json1").appendSelector(
//       [
//         "var",
//         "dictionary",
//         "array",
//         "number",
//         "string",
//         "true_false",
//         "if_logic",
//         "logical",
//         "not",
//         "boolean",
//         "comparison",
//         "minmax",
//         "between",
//         "arithmatic",
//         "map_filter",
//         "merge",
//         "InMiss",
//         "inString",
//         "catString",
//         "subStr",
//       ],
//       Blockly.selectionArrow(),
//       "null"
//     )
//     this.appendValueInput("json2").appendSelector(
//       [
//         "var",
//         "dictionary",
//         "array",
//         "number",
//         "string",
//         "true_false",
//         "if_logic",
//         "logical",
//         "not",
//         "boolean",
//         "comparison",
//         "minmax",
//         "between",
//         "arithmatic",
//         "map_filter",
//         "merge",
//         "InMiss",
//         "inString",
//         "catString",
//         "subStr",
//       ],
//       Blockly.selectionArrow(),
//       "null"
//     )

//     this.setInputsInline(true)
//   },
// }

// //-------------------------------------------------------------------------------------------------------

// Blockly.Blocks["arithmatic"] = {
//   length: 0,
//   init: function () {
//     this.setColour(330)
//     this.setOutput(true, ["element"])
//     var options = [
//       ["*", "*"],
//       ["/", "/"],
//       ["+", "+"],
//       ["-", "-"],
//       ["%", "%"],
//     ]

//     this.appendDummyInput("Arithmatic")
//       .appendField(" Arithmatic ")
//       .appendField(new Blockly.FieldDropdown(options), "operator")
//       .appendField("  ")
//       .appendField(
//         new Blockly.FieldTextbutton("+", function () {
//           this.sourceBlock_.appendElementInput()
//         })
//       )
//       .appendField("  ")

//     this.setInputsInline(true)
//   },
//   appendElementInput: function () {
//     appendElementInput(this)
//   },
//   deleteElementInput: function (inputToDelete) {
//     deleteElementInput(inputToDelete, this)
//   },
// }

// //-------------------------------------------------------------------------------------------------------

// Blockly.Blocks["map_filter"] = {
//   length: 0,
//   init: function () {
//     this.setColour(330)
//     this.setOutput(true, ["element"])
//     var options = [
//       ["map", "map"],
//       ["filter", "filter"],
//       ["reduce", "reduce"],
//       ["all", "all"],
//       ["some", "some"],
//       ["none", "none"],
//     ]

//     this.appendDummyInput("json0")
//       .appendField(new Blockly.FieldDropdown(options), "operator")
//       .appendSelector(
//         [
//           "var",
//           "dictionary",
//           "array",
//           "number",
//           "string",
//           "true_false",
//           "if_logic",
//           "logical",
//           "not",
//           "boolean",
//           "comparison",
//           "minmax",
//           "between",
//           "arithmatic",
//           "map_filter",
//           "merge",
//           "InMiss",
//           "inString",
//           "catString",
//           "subStr",
//         ],
//         Blockly.selectionArrow(),
//         "null"
//       )
//       .appendField("  ")
//       .appendField(
//         new Blockly.FieldTextbutton("+", function () {
//           this.sourceBlock_.appendElementInput()
//         })
//       )
//       .appendField("  ")
//     this.setInputsInline(false)
//   },
//   appendElementInput: function () {
//     appendElementInput(this)
//   },
//   deleteElementInput: function (inputToDelete) {
//     deleteElementInput(inputToDelete, this)
//   },
// }
// //------------------------------------------------------------------------------------------------------------
// Blockly.Blocks["merge"] = {
//   length: 0,
//   init: function () {
//     this.setColour(330)
//     this.setOutput(true, ["element"])

//     this.appendDummyInput("merge")
//       .appendField(" Merge ")
//       .appendField(
//         new Blockly.FieldTextbutton("+", function () {
//           this.sourceBlock_.appendElementInput()
//         })
//       )
//       .appendField("  ")
//     this.setInputsInline(true)
//   },
//   appendElementInput: function () {
//     appendElementInput(this)
//   },
//   deleteElementInput: function (inputToDelete) {
//     deleteElementInput(inputToDelete, this)
//   },
// }

// //-------------------------------------------------------------------------------------------------------------
// Blockly.Blocks["InMiss"] = {
//   length: 0,
//   init: function () {
//     this.setColour(330)
//     this.setOutput(true, ["element"])
//     var options = [
//       ["in", "in"],
//       ["missing", "missing"],
//       ["missing_some", "missing_some"],
//     ]

//     this.appendDummyInput("json0")
//       .appendField(new Blockly.FieldDropdown(options), "operator")
//       .appendSelector(
//         [
//           "var",
//           "dictionary",
//           "array",
//           "number",
//           "string",
//           "true_false",
//           "if_logic",
//           "logical",
//           "not",
//           "boolean",
//           "comparison",
//           "minmax",
//           "between",
//           "arithmatic",
//           "map_filter",
//           "merge",
//           "InMiss",
//           "inString",
//           "catString",
//           "subStr",
//         ],
//         Blockly.selectionArrow(),
//         "null"
//       )
//       .appendField(
//         new Blockly.FieldTextbutton("+", function () {
//           this.sourceBlock_.appendElementInput()
//         })
//       )
//       .appendField("  ")
//     this.setInputsInline(false)
//   },
//   appendElementInput: function () {
//     appendElementInput(this)
//   },
//   deleteElementInput: function (inputToDelete) {
//     deleteElementInput(inputToDelete, this)
//   },
// }
// //----------------------------------------------------------------------------------------------------------
// Blockly.Blocks["inString"] = {
//   init: function () {
//     this.appendValueInput("json0").appendSelector(
//       [
//         "var",
//         "dictionary",
//         "array",
//         "number",
//         "string",
//         "true_false",
//         "if_logic",
//         "logical",
//         "not",
//         "boolean",
//         "comparison",
//         "minmax",
//         "between",
//         "arithmatic",
//         "map_filter",
//         "merge",
//         "InMiss",
//         "inString",
//         "catString",
//         "subStr",
//       ],
//       Blockly.selectionArrow(),
//       "null"
//     )
//     this.appendValueInput("json1")
//       .appendField("in  ")
//       .appendSelector(
//         [
//           "var",
//           "dictionary",
//           "array",
//           "number",
//           "string",
//           "true_false",
//           "if_logic",
//           "logical",
//           "not",
//           "boolean",
//           "comparison",
//           "minmax",
//           "between",
//           "arithmatic",
//           "map_filter",
//           "merge",
//           "InMiss",
//           "inString",
//           "catString",
//           "subStr",
//         ],
//         Blockly.selectionArrow(),
//         "null"
//       )
//     this.setInputsInline(true)
//     this.setOutput(true, ["element"])
//     this.setColour(210)
//   },
// }
// //-------------------------------------------------------------------------------------------------------

// Blockly.Blocks["catString"] = {
//   length: 0,
//   init: function () {
//     this.setColour(330)
//     this.setOutput(true, ["element"])

//     this.appendDummyInput("cat")
//       .appendField(" cat ")
//       .appendField(
//         new Blockly.FieldTextbutton("+", function () {
//           this.sourceBlock_.appendElementInput()
//         })
//       )
//     this.setInputsInline(false)
//   },
//   appendElementInput: function () {
//     appendElementInput(this)
//   },
//   deleteElementInput: function (inputToDelete) {
//     deleteElementInput(inputToDelete, this)
//   },
// }

// //-------------------------------------------------------------------------------------------------------

// Blockly.Blocks["subStr"] = {
//   length: 0,
//   init: function () {
//     this.setColour(330)
//     this.setOutput(true, ["element"])

//     this.appendDummyInput("substr")
//       .appendField(" substr ")
//       .appendField(
//         new Blockly.FieldTextbutton("+", function () {
//           this.sourceBlock_.appendElementInput()
//         })
//       )
//     this.setInputsInline(false)
//   },
//   appendElementInput: function () {
//     appendElementInput(this)
//   },
//   deleteElementInput: function (inputToDelete) {
//     deleteElementInput(inputToDelete, this)
//   },
// }
// //-------------------------------------------------------------------------------------------------------

// Blockly.Blocks["log"] = {
//   length: 0,
//   init: function () {
//     this.setColour(130)
//     this.setOutput(true, ["element"])

//     this.appendValueInput("json0")
//       .appendField(" log ")
//       .appendSelector(
//         [
//           "var",
//           "dictionary",
//           "array",
//           "number",
//           "string",
//           "true_false",
//           "if_logic",
//           "logical",
//           "not",
//           "boolean",
//           "comparison",
//           "minmax",
//           "between",
//           "arithmatic",
//           "map_filter",
//           "merge",
//           "InMiss",
//           "inString",
//           "catString",
//           "subStr",
//         ],
//         Blockly.selectionArrow(),
//         "null"
//       )
//     this.setInputsInline(false)
//   },
// }

// //-------------------------------------------------------------------------------------------------------
