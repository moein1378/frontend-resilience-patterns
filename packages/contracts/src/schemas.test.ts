import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import {
  AttemptRequestSchema,
  ScenarioCollectionSchema,
  SuccessBodySchema,
  WorkloadCollectionSchema,
} from "./schemas.js";

async function readJson(path: string): Promise<unknown> {
  return JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
}

describe("versioned resilience contracts", () => {
  it("accepts every repository-owned scenario and workload", async () => {
    expect(
      ScenarioCollectionSchema.parse(
        await readJson("../../../specs/scenarios.json"),
      ),
    ).toHaveLength(9);
    expect(
      WorkloadCollectionSchema.parse(
        await readJson("../../../specs/workloads.json"),
      ),
    ).toHaveLength(4);
  });

  it("rejects unsupported versions and duplicate ids", async () => {
    const scenarios = ScenarioCollectionSchema.parse(
      await readJson("../../../specs/scenarios.json"),
    );
    expect(
      ScenarioCollectionSchema.safeParse([
        { ...scenarios[0], schemaVersion: 2 },
      ]).success,
    ).toBe(false);
    expect(
      ScenarioCollectionSchema.safeParse([scenarios[0], scenarios[0]]).success,
    ).toBe(false);
  });

  it("rejects impossible probabilities, excessive delays, and out-of-range attempts", async () => {
    const scenario = ScenarioCollectionSchema.parse(
      await readJson("../../../specs/scenarios.json"),
    )[0]!;
    expect(
      ScenarioCollectionSchema.safeParse([
        {
          ...scenario,
          faultProfile: { ...scenario.faultProfile, probability: 1.1 },
        },
      ]).success,
    ).toBe(false);
    expect(
      ScenarioCollectionSchema.safeParse([
        {
          ...scenario,
          faultProfile: { ...scenario.faultProfile, latencyMs: 10_001 },
        },
      ]).success,
    ).toBe(false);
    expect(
      AttemptRequestSchema.safeParse({
        schemaVersion: 1,
        scenarioId: "healthy-baseline",
        seed: "resilience-v1",
        runId: "run-a",
        operationId: "read-001",
        operationOrdinal: 0,
        attemptIndex: 5,
        endpoint: "catalog",
        classification: "read",
        logicalMethod: "GET",
      }).success,
    ).toBe(false);
  });

  it("rejects a nominal success body with malformed synthetic data", () => {
    expect(
      SuccessBodySchema.safeParse({
        schemaVersion: 1,
        operationId: "read-001",
        attemptIndex: 0,
        syntheticData: { label: 42 },
        generatedAtOffsetMs: 80,
        source: "fixture",
      }).success,
    ).toBe(false);
  });
});
