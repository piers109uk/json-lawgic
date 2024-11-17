Here is a complete DSL specification for JsonLogic, including all supported operations and examples for each:

### Accessing Data

- **var**: Retrieve data from the provided data object.

  ```json
  { "var": ["a"] }
  ```

  Data: `{ "a": 1, "b": 2 }`
  Result: `1`

- **missing**: Returns an array of any keys that are missing from the data object.

  ```json
  { "missing": ["a", "b"] }
  ```

  Data: `{ "a": "apple", "c": "carrot" }`
  Result: `["b"]`

- **missing_some**: Returns an empty array if the minimum number of keys is met, or an array of the missing keys otherwise.
  ```json
  { "missing_some": [1, ["a", "b", "c"]] }
  ```
  Data: `{ "a": "apple" }`
  Result: `[]`

### Logic and Boolean Operations

- **if**: Conditional logic.

  ```json
  { "if": [true, "yes", "no"] }
  ```

  Result: `"yes"`

- **==**: Tests equality, with type coercion.

  ```json
  { "==": [1, "1"] }
  ```

  Result: `true`

- **===**: Tests strict equality.

  ```json
  { "===": [1, "1"] }
  ```

  Result: `false`

- **!=**: Tests not-equal, with type coercion.

  ```json
  { "!=": [1, 2] }
  ```

  Result: `true`

- **!==**: Tests strict not-equal.

  ```json
  { "!==": [1, "1"] }
  ```

  Result: `true`

- **!**: Logical negation.

  ```json
  { "!": true }
  ```

  Result: `false`

- **!!**: Double negation, or “cast to a boolean.”

  ```json
  { "!!": ["0"] }
  ```

  Result: `true`

- **or**: Returns the first truthy argument, or the last argument.

  ```json
  { "or": [false, "a"] }
  ```

  Result: `"a"`

- **and**: Returns the first falsy argument, or the last argument.
  ```json
  { "and": [true, "a", 3] }
  ```
  Result: `3`

### Numeric Operations

- **>**: Greater than.

  ```json
  { ">": [2, 1] }
  ```

  Result: `true`

- **>=**: Greater than or equal to.

  ```json
  { ">=": [1, 1] }
  ```

  Result: `true`

- **<**: Less than.

  ```json
  { "<": [1, 2] }
  ```

  Result: `true`

- **<=**: Less than or equal to.

  ```json
  { "<=": [1, 1] }
  ```

  Result: `true`

- **Between**: Test that one value is between two others.

  ```json
  { "<": [1, 2, 3] }
  ```

  Result: `true`

- **max**: Return the maximum from a list of values.

  ```json
  { "max": [1, 2, 3] }
  ```

  Result: `3`

- **min**: Return the minimum from a list of values.

  ```json
  { "min": [1, 2, 3] }
  ```

  Result: `1`

- **+**: Addition.

  ```json
  { "+": [4, 2] }
  ```

  Result: `6`

- **-**: Subtraction.

  ```json
  { "-": [4, 2] }
  ```

  Result: `2`

- **\***: Multiplication.

  ```json
  { "*": [4, 2] }
  ```

  Result: `8`

- **/**: Division.

  ```json
  { "/": [4, 2] }
  ```

  Result: `2`

- **%**: Modulo.
  ```json
  { "%": [101, 2] }
  ```
  Result: `1`

### Array Operations

- **map**: Perform an action on every member of an array.

  ```json
  { "map": [{ "var": "integers" }, { "*": [{ "var": "" }, 2] }] }
  ```

  Data: `{ "integers": [1, 2, 3, 4, 5] }`
  Result: `[2, 4, 6, 8, 10]`

- **filter**: Keep only elements of the array that pass a test.

  ```json
  { "filter": [{ "var": "integers" }, { "%": [{ "var": "" }, 2] }] }
  ```

  Data: `{ "integers": [1, 2, 3, 4, 5] }`
  Result: `[1, 3, 5]`

- **reduce**: Combine all the elements in an array into a single value.

  ```json
  { "reduce": [{ "var": "integers" }, { "+": [{ "var": "current" }, { "var": "accumulator" }] }, 0] }
  ```

  Data: `{ "integers": [1, 2, 3, 4, 5] }`
  Result: `15`

- **all**: Test if all elements in an array pass a test.

  ```json
  { "all": [[1, 2, 3], { ">": [{ "var": "" }, 0] }] }
  ```

  Result: `true`

- **none**: Test if no elements in an array pass a test.

  ```json
  { "none": [[-3, -2, -1], { ">": [{ "var": "" }, 0] }] }
  ```

  Result: `true`

- **some**: Test if some elements in an array pass a test.

  ```json
  { "some": [[-1, 0, 1], { ">": [{ "var": "" }, 0] }] }
  ```

  Result: `true`

- **merge**: Merge one or more arrays into one array.

  ```json
  {
    "merge": [
      [1, 2],
      [3, 4]
    ]
  }
  ```

  Result: `[1, 2, 3, 4]`

- **in**: Test if the first argument is a member of the array.
  ```json
  { "in": ["Ringo", ["John", "Paul", "George", "Ringo"]] }
  ```
  Result: `true`

### String Operations

- **in**: Test if the first argument is a substring of the second.

  ```json
  { "in": ["Spring", "Springfield"] }
  ```

  Result: `true`

- **cat**: Concatenate all the supplied arguments.

  ```json
  { "cat": ["I love", " pie"] }
  ```

  Result: `"I love pie"`

- **substr**: Get a portion of a string.
  ```json
  { "substr": ["jsonlogic", 4] }
  ```
  Result: `"logic"`

### Miscellaneous

- **log**: Logs the first value to console, then passes it through unmodified.
  ```json
  { "log": "apple" }
  ```
  Result: `"apple"` (Check your developer console!)

This specification provides a comprehensive overview of the operations supported by JsonLogic, along with examples to illustrate their usage.
