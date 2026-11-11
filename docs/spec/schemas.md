# Schemas

Language-independent [JSON Schema](https://json-schema.org/)s (draft 2020-12).

## Progress

Stored in the browser's `localStorage` under the key `molecuzzle-v2` ([Progress.01](features.md#progress)). Every field is optional; a missing or unreadable value counts as empty.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "progress",
  "title": "Progress",
  "type": "object",
  "properties": {
    "puzzles": {
      "type": "object",
      "description": "Per Puzzle, by its id",
      "additionalProperties": { "enum": ["solved", "revealed"] }
    },
    "current": { "type": "string", "description": "The id of the open Puzzle" }
  }
}
```

Example: Puzzle 1 solved, the solution of Puzzle 2 seen, and Puzzle 3 open.

```json
{
  "puzzles": { "water": "solved", "ammonia": "revealed" },
  "current": "formaldehyde"
}
```

A Puzzle's id is its `id` in `src/puzzles.js`, e.g. `acetic-acid`.
