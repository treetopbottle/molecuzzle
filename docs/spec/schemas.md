# Schemas

Formats of data going in or out of Molecuzzle, independent of the language, as [JSON Schema](https://json-schema.org/) (draft 2020-12). Rules link to them from the [spec](README.md).

## Progress

Stored in the browser's `localStorage` under the key `molecuzzle-v1` ([Progress.01](README.md#progress)). Every field is optional; a missing or unreadable value counts as empty.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "progress",
  "title": "Progress",
  "type": "object",
  "properties": {
    "solved": {
      "type": "object",
      "description": "Per Level, by its number minus one",
      "propertyNames": { "pattern": "^(0|[1-9][0-9]*)$" },
      "additionalProperties": { "enum": ["solved", "revealed"] }
    },
    "discovered": {
      "type": "array",
      "description": "Ids of the Known Molecules in the Collection, in the order found",
      "items": { "type": "string" },
      "uniqueItems": true
    },
    "current": { "type": "integer", "minimum": 0, "description": "The last Level played, by its number minus one" },
    "seenHelp": { "type": "boolean", "description": "Whether How to play was shown" }
  }
}
```

Example: Levels 1 and 2 solved, the solution of Level 3 seen, and Level 4 open.

```json
{
  "solved": { "0": "solved", "1": "solved", "2": "revealed" },
  "discovered": ["hydrogen", "water", "ammonia"],
  "current": 3,
  "seenHelp": true
}
```

A Known Molecule's id is its key in `CATALOG` in `index.html`, e.g. `dimethylEther`.
