import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { parse } from "yaml";
import { generateTracker, generateTypes } from "./generate.js";
import type { Schema } from "./generate.js";

function main() {
  const { values } = parseArgs({
    options: {
      schema: { type: "string" },
      out: { type: "string" },
    },
  });

  if (!(values.schema && values.out)) {
    console.error("Usage: alyt-codegen --schema <path> --out <dir>");
    process.exit(1);
  }

  const schemaPath = resolve(values.schema);
  const outDir = resolve(values.out);

  const raw = readFileSync(schemaPath, "utf-8");
  const schema = parse(raw) as Schema;

  const eventNames = Object.keys(schema.events);

  writeFileSync(resolve(outDir, "types.ts"), generateTypes(schema));
  writeFileSync(resolve(outDir, "tracker.ts"), generateTracker(schema));

  console.log(`Generated ${eventNames.length} events: types.ts and tracker.ts`);
}

main();
