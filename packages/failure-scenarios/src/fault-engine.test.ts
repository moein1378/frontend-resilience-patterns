import { describe, expect, it } from "vitest";
import type { FaultProfile } from "@frp/contracts";
import {
  builtInScenarios,
  builtInWorkloads,
  buildWorkloadPlan,
  faultFor,
  hash32,
} from "./index.js";

describe("deterministic fault engine", () => {
  it("keeps the documented FNV-1a reference vectors stable", () => {
    expect(hash32("")).toBe(2_166_136_261);
    expect(hash32("a")).toBe(3_826_002_220);
    expect(hash32("hello")).toBe(1_335_831_723);
  });

  it("builds the same immutable workload plan for the same input", () => {
    const scenario = builtInScenarios.find(
      ({ id }) => id === "intermittent-503",
    );
    const workload = builtInWorkloads.find(
      ({ id }) => id === scenario?.workloadId,
    );
    expect(scenario).toBeDefined();
    expect(workload).toBeDefined();
    const first = buildWorkloadPlan(scenario!, workload!);
    const second = buildWorkloadPlan(scenario!, workload!);
    expect(first).toEqual(second);
    expect(
      first.map(({ operationOrdinal, operationId }) => [
        operationOrdinal,
        operationId,
      ]),
    ).toEqual([
      [0, "read-001"],
      [1, "read-002"],
      [2, "read-003"],
      [3, "read-004"],
      [4, "read-005"],
    ]);
    expect(Object.isFrozen(first)).toBe(true);
  });

  it.each([
    ["healthy-baseline", 0, "success", 200, 80],
    ["latency-spike", 2, "success", 200, 1000],
    ["intermittent-503", 0, "http-error", 503, 120],
    ["intermittent-503", 2, "success", 200, 120],
    ["throttled-429", 0, "http-error", 429, 75],
    ["connection-drop", 0, "disconnect", 0, 120],
    ["malformed-payload", 0, "malformed", 200, 90],
    ["dependency-burst", 0, "success", 200, 500],
    ["unsafe-mutation", 0, "http-error", 503, 100],
  ] as const)(
    "maps %s operation %i to a stable fault",
    (scenarioId, ordinal, kind, statusCode, latencyMs) => {
      const scenario = builtInScenarios.find(({ id }) => id === scenarioId)!;
      const workload = builtInWorkloads.find(
        ({ id }) => id === scenario.workloadId,
      )!;
      const operation = buildWorkloadPlan(scenario, workload)[ordinal]!;
      expect(
        faultFor({
          scenarioSeed: scenario.seed,
          scenarioId,
          operationId: operation.operationId,
          operationOrdinal: ordinal,
          attemptIndex: 0,
          endpoint: operation.endpoint,
          profile: scenario.faultProfile,
        }),
      ).toMatchObject({ kind, statusCode, latencyMs });
    },
  );

  it("uses a seeded probability without Math.random or run id input", () => {
    const profile: FaultProfile = {
      mode: "seeded-probability",
      latencyMs: 10,
      statusSequence: [503],
      disconnectAttempts: [],
      malformedAttempts: [],
      probability: 0.5,
    };
    const input = {
      scenarioSeed: "resilience-v1",
      scenarioId: "seeded-test",
      operationId: "read-001",
      operationOrdinal: 0,
      attemptIndex: 0,
      endpoint: "catalog" as const,
      profile,
    };
    expect(faultFor(input)).toEqual(faultFor(input));
  });
});
