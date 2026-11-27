// @ts-nocheck
// The schemas of docs/spec/schemas/, all in one Ajv, so the $refs between
// them resolve.
import Ajv2020 from "ajv/dist/2020.js";
import { readdirSync, readFileSync } from "node:fs";

const dir = new URL("../../docs/spec/schemas/", import.meta.url);
const ajv = new Ajv2020({ allErrors: true });
for (const file of readdirSync(dir).filter(f => f.endsWith(".schema.json")))
  ajv.addSchema(JSON.parse(readFileSync(new URL(file, dir), "utf8")));

/** What doesn't fit the schema in this file, e.g. "board.schema.json"; [] if it all fits. */
export function schemaErrors(file, data) {
  const validate = ajv.getSchema(file);
  if (!validate) throw new Error(`no schema ${file}`);
  return validate(data) ? [] : validate.errors.map(e => `${e.instancePath || "/"} ${e.message}`);
}
