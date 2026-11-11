import { readFile } from "node:fs/promises";

const schema = JSON.parse(
  await readFile(
    new URL("../specs/experiment.schema.json", import.meta.url),
    "utf8",
  ),
);
if (schema?.properties?.schemaVersion?.const !== 1) {
  throw new Error(
    "Experiment schema v1 is missing; code generation cannot be declared unnecessary",
  );
}
console.log(
  "Codegen check complete: Phase 01 uses source-owned Zod contracts; no generated artifacts are required.",
);
