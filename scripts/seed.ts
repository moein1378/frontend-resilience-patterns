import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import {
  ScenarioCollectionSchema,
  WorkloadCollectionSchema,
} from "../packages/contracts/src/schemas.ts";

async function parse(path: string): Promise<unknown> {
  return JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
}

const scenarioText = await readFile(
  new URL("../specs/scenarios.json", import.meta.url),
  "utf8",
);
const scenarios = ScenarioCollectionSchema.parse(JSON.parse(scenarioText));
const workloads = WorkloadCollectionSchema.parse(
  await parse("../specs/workloads.json"),
);
const knownWorkloads = new Set(workloads.map(({ id }) => id));
if (scenarios.some(({ workloadId }) => !knownWorkloads.has(workloadId))) {
  throw new Error("A scenario references an unknown workload");
}
const digest = createHash("sha256")
  .update(scenarioText)
  .digest("hex")
  .slice(0, 12);
console.log(
  `Seed validated: ${scenarios.length} scenarios, ${workloads.length} workloads, scenarios sha256 ${digest}`,
);
