import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  buildWorkloadPlan,
  findScenario,
  findWorkload,
} from "@frp/failure-scenarios";
import {
  createSeededRandom,
  runProtected,
  SystemClock,
} from "@frp/resilience-core";
import { createTelemetryCollector, projectMetrics } from "@frp/telemetry";
import { createFixtureTransport } from "../../apps/lab/src/modules/experiment/adapters/fixture-transport.adapter.js";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());
it("recovers the same seeded fixture with metrics measured on complete logical operations", async () => {
  const scenario = findScenario("intermittent-503")!;
  const workload = findWorkload(scenario.workloadId)!;
  const collector = createTelemetryCollector();
  const clock = new SystemClock();
  const pending = runProtected(
    {
      runId: "run-integration",
      scenarioId: scenario.id,
      seed: scenario.seed,
      operations: buildWorkloadPlan(scenario, workload),
    },
    {
      clock,
      transport: createFixtureTransport({ clock }),
      signal: new AbortController().signal,
      telemetry: collector,
      random: createSeededRandom(scenario.seed),
    },
  );
  await vi.runAllTimersAsync();
  const result = await pending;
  const metrics = projectMetrics(collector.events());
  expect(result.operations.every((op) => op.outcome === "success")).toBe(true);
  expect(metrics.logicalSuccessRate).toMatchObject({
    numerator: 5,
    denominator: 5,
  });
  expect(metrics.upstreamAttempts).toBeGreaterThan(5);
  expect(metrics.p95LatencyMs).toBe(
    Math.max(...result.operations.map((op) => op.durationMs)),
  );
  expect(metrics.retryAmplification).toBe(metrics.upstreamAttempts / 5);
});
it("the retry storm fixture exhibits aligned retries versus dispersed seeded jitter", async () => {
  const scenario = findScenario("retry-storm")!;
  const workload = findWorkload(scenario.workloadId)!;
  const run = async (jitter: "none" | "full") => {
    const collector = createTelemetryCollector();
    const clock = new SystemClock();
    const pending = runProtected(
      {
        runId: `run-${jitter}`,
        scenarioId: scenario.id,
        seed: scenario.seed,
        operations: buildWorkloadPlan(scenario, workload),
      },
      {
        clock,
        transport: createFixtureTransport({ clock }),
        signal: new AbortController().signal,
        telemetry: collector,
        random: createSeededRandom(scenario.seed),
      },
      { budgetMs: 1500, maxAttempts: 3, baseDelayMs: 200, capMs: 2000, jitter },
    );
    await vi.runAllTimersAsync();
    await pending;
    return collector
      .events()
      .filter((e) => e.kind === "attempt-started" && e.attemptIndex === 1)
      .map((e) => e.atMs);
  };
  expect(new Set(await run("none")).size).toBe(1);
  expect(new Set(await run("full")).size).toBeGreaterThan(1);
});

it("protected fixture and Hono HTTP adapter recover with equivalent outcomes and attempt counts", async () => {
  const { createHonoApp } = await import("../../apps/chaos-api/src/app.js");
  const { createHttpTransport } =
    await import("../../apps/lab/src/modules/experiment/adapters/http-transport.adapter.js");
  const scenario = findScenario("intermittent-503")!;
  const workload = findWorkload(scenario.workloadId)!;
  const run = async (local: boolean) => {
    const clock = new SystemClock();
    const app = createHonoApp({ clock });
    const transport = local
      ? createHttpTransport({
          baseUrl: "http://localhost:3001",
          fetch: async (input, init) => app.request(input, init),
        })
      : createFixtureTransport({ clock });
    const pending = runProtected(
      {
        runId: "run-parity",
        scenarioId: scenario.id,
        seed: scenario.seed,
        operations: buildWorkloadPlan(scenario, workload),
      },
      {
        clock,
        transport,
        signal: new AbortController().signal,
        telemetry: createTelemetryCollector(),
        random: createSeededRandom(scenario.seed),
      },
    );
    await vi.runAllTimersAsync();
    return (await pending).operations.map(({ outcome, attemptCount }) => ({
      outcome,
      attemptCount,
    }));
  };
  expect(await run(true)).toEqual(await run(false));
});
