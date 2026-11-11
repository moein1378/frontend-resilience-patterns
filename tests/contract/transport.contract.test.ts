import { afterEach, describe, expect, it, vi } from "vitest";
import type { AttemptRequest } from "@frp/contracts";
import {
  buildWorkloadPlan,
  builtInScenarios,
  builtInWorkloads,
} from "@frp/failure-scenarios";
import { createFixtureTransport } from "../../apps/lab/src/modules/experiment/adapters/fixture-transport.adapter.js";
import { ImmediateClock, semanticOutcome } from "../support/transport.js";

describe("fixture transport contract", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("executes every built-in scenario without calling fetch", async () => {
    vi.stubGlobal("fetch", () => {
      throw new Error("Fixture mode must not call fetch");
    });
    const transport = createFixtureTransport({ clock: new ImmediateClock() });
    for (const scenario of builtInScenarios) {
      const workload = builtInWorkloads.find(
        ({ id }) => id === scenario.workloadId,
      )!;
      const operation = buildWorkloadPlan(scenario, workload)[0]!;
      const outcome = await semanticOutcome(transport, {
        schemaVersion: 1,
        scenarioId: scenario.id,
        seed: scenario.seed,
        runId: "run-contract",
        operationId: operation.operationId,
        operationOrdinal: operation.operationOrdinal,
        attemptIndex: 0,
        endpoint: operation.endpoint,
        classification: operation.classification,
        logicalMethod: operation.logicalMethod,
      });
      expect(["success", "http-error", "disconnect", "malformed"]).toContain(
        outcome.kind,
      );
    }
  });

  it("preserves stable synthetic identity across replays", async () => {
    const request: AttemptRequest = {
      schemaVersion: 1,
      scenarioId: "healthy-baseline",
      seed: "resilience-v1",
      runId: "run-contract",
      operationId: "read-001",
      operationOrdinal: 0,
      attemptIndex: 0,
      endpoint: "catalog",
      classification: "read",
      logicalMethod: "GET",
    };
    const first = await semanticOutcome(
      createFixtureTransport({ clock: new ImmediateClock() }),
      request,
    );
    const second = await semanticOutcome(
      createFixtureTransport({ clock: new ImmediateClock() }),
      request,
    );
    expect(first).toEqual(second);
    expect(first.syntheticId).toBe("item-347242068");
  });
});
