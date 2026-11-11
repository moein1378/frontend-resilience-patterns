import { describe, expect, it } from "vitest";
import {
  AttemptRequestSchema,
  SuccessBodySchema,
  type AttemptRequest,
} from "@frp/contracts";
import {
  buildWorkloadPlan,
  builtInScenarios,
  builtInWorkloads,
} from "@frp/failure-scenarios";
import { createHonoApp } from "../../apps/chaos-api/src/app.js";
import { createFixtureTransport } from "../../apps/lab/src/modules/experiment/adapters/fixture-transport.adapter.js";
import { createHttpTransport } from "../../apps/lab/src/modules/experiment/adapters/http-transport.adapter.js";
import { ImmediateClock, semanticOutcome } from "../support/transport.js";

function request(overrides: Partial<AttemptRequest> = {}): AttemptRequest {
  return AttemptRequestSchema.parse({
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
    ...overrides,
  });
}

describe("Hono chaos API boundary", () => {
  const app = createHonoApp({ clock: new ImmediateClock() });

  it("exposes bounded health and safe scenario metadata", async () => {
    expect((await app.request("/healthz")).status).toBe(200);
    const response = await app.request("/v1/scenarios");
    expect(response.status).toBe(200);
    expect((await response.json()) as unknown[]).toHaveLength(9);
  });

  it("rejects wrong content type, invalid JSON, oversized bodies, unsupported versions, and bad attempts", async () => {
    expect(
      (await app.request("/v1/execute", { method: "POST", body: "{}" })).status,
    ).toBe(415);
    expect(
      (
        await app.request("/v1/execute", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: "{",
        })
      ).status,
    ).toBe(400);
    expect(
      (
        await app.request("/v1/execute", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ...request(), schemaVersion: 2 }),
        })
      ).status,
    ).toBe(422);
    expect(
      (
        await app.request("/v1/execute", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ...request(), attemptIndex: 5 }),
        })
      ).status,
    ).toBe(400);
    expect(
      (
        await app.request("/v1/execute", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ...request(), padding: "x".repeat(33_000) }),
        })
      ).status,
    ).toBe(413);
  });

  it("matches fixture semantic outcomes and synthetic identity for every scenario", async () => {
    const localApp = createHonoApp({ clock: new ImmediateClock() });
    const local = createHttpTransport({
      baseUrl: "http://localhost:3001",
      fetch: async (input, init) => localApp.request(input, init),
    });
    const fixture = createFixtureTransport({ clock: new ImmediateClock() });
    for (const scenario of builtInScenarios) {
      const workload = builtInWorkloads.find(
        ({ id }) => id === scenario.workloadId,
      )!;
      const operation = buildWorkloadPlan(scenario, workload)[0]!;
      const attempt = request({
        scenarioId: scenario.id,
        seed: scenario.seed,
        operationId: operation.operationId,
        operationOrdinal: operation.operationOrdinal,
        endpoint: operation.endpoint,
        classification: operation.classification,
        logicalMethod: operation.logicalMethod,
      });
      expect(await semanticOutcome(local, attempt)).toEqual(
        await semanticOutcome(fixture, attempt),
      );
    }
  });

  it("returns an intentionally malformed nominal 200 for client validation", async () => {
    const response = await app.request("/v1/execute", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(request({ scenarioId: "malformed-payload" })),
    });
    expect(response.status).toBe(200);
    expect(SuccessBodySchema.safeParse(await response.json()).success).toBe(
      false,
    );
  });
});
