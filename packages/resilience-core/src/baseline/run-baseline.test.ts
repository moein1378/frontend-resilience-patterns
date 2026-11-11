import { describe, expect, it } from "vitest";
import type { AttemptResponse, TraceEventDraft } from "@frp/contracts";
import { runBaseline, SyntheticTransportError } from "./run-baseline.js";
import type {
  BaselineRunInput,
  Clock,
  TelemetrySink,
  Transport,
} from "../index.js";

class ImmediateClock implements Clock {
  #now = 0;

  now(): number {
    return this.#now;
  }

  async sleep(delayMs: number, signal?: AbortSignal): Promise<void> {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    this.#now += delayMs;
  }
}

function input(operationCount = 1): BaselineRunInput {
  return {
    runId: "run-a",
    scenarioId: "scenario-a",
    seed: "resilience-v1",
    operations: Array.from(
      { length: operationCount },
      (_, operationOrdinal) => ({
        operationId: `read-00${operationOrdinal + 1}`,
        operationOrdinal,
        arrivalAtMs: operationOrdinal * 10,
        endpoint: "catalog",
        classification: "read",
        logicalMethod: "GET",
      }),
    ),
  };
}

function success(body: unknown = undefined): AttemptResponse {
  return {
    statusCode: 200,
    headers: {},
    body:
      body ??
      ({
        schemaVersion: 1,
        operationId: "read-001",
        attemptIndex: 0,
        syntheticData: { itemId: "item-1", label: "Synthetic catalog item" },
        generatedAtOffsetMs: 80,
        source: "fixture",
      } satisfies unknown),
  };
}

function telemetry(events: TraceEventDraft[]): TelemetrySink {
  return { emit: (event) => events.push(event) };
}

describe("Phase 01 baseline runner", () => {
  it("classifies a validated 2xx payload as logical success", async () => {
    const events: TraceEventDraft[] = [];
    const transport: Transport = { execute: async () => success() };
    const snapshot = await runBaseline(input(), {
      clock: new ImmediateClock(),
      transport,
      telemetry: telemetry(events),
      signal: new AbortController().signal,
    });
    expect(snapshot.operations).toMatchObject([
      { outcome: "success", statusCode: 200, attemptCount: 1 },
    ]);
    expect(events.map(({ kind }) => kind)).toContain("attempt-started");
  });

  it("classifies 503, disconnect, malformed 200, and abort distinctly", async () => {
    const cases: Array<[string, Transport, AbortSignal, string]> = [
      [
        "503",
        {
          execute: async () => ({
            statusCode: 503,
            headers: {},
            body: { code: "SYNTHETIC_503" },
          }),
        },
        new AbortController().signal,
        "http-5xx",
      ],
      [
        "disconnect",
        {
          execute: async () =>
            Promise.reject(
              new SyntheticTransportError(
                "network-error",
                "Synthetic disconnect",
              ),
            ),
        },
        new AbortController().signal,
        "network-error",
      ],
      [
        "malformed",
        { execute: async () => success({ wrong: true }) },
        new AbortController().signal,
        "invalid-payload",
      ],
      [
        "abort",
        { execute: async () => success() },
        (() => {
          const controller = new AbortController();
          controller.abort();
          return controller.signal;
        })(),
        "abort",
      ],
    ];
    for (const [, transport, signal, outcome] of cases) {
      const snapshot = await runBaseline(input(), {
        clock: new ImmediateClock(),
        transport,
        telemetry: telemetry([]),
        signal,
      });
      expect(snapshot.operations[0]?.outcome).toBe(outcome);
    }
  });

  it("starts exactly one physical attempt per Phase 01 operation", async () => {
    let attempts = 0;
    const snapshot = await runBaseline(input(3), {
      clock: new ImmediateClock(),
      transport: {
        execute: async (request) => {
          attempts += 1;
          return success({
            schemaVersion: 1,
            operationId: request.operationId,
            attemptIndex: 0,
            syntheticData: {
              itemId: `item-${attempts}`,
              label: "Synthetic catalog item",
            },
            generatedAtOffsetMs: 10,
            source: "fixture",
          });
        },
      },
      telemetry: telemetry([]),
      signal: new AbortController().signal,
    });
    expect(attempts).toBe(3);
    expect(snapshot.operations.map(({ attemptCount }) => attemptCount)).toEqual(
      [1, 1, 1],
    );
  });

  it("does not record an upstream attempt when cancellation happens before admission", async () => {
    const controller = new AbortController();
    controller.abort();
    const events: TraceEventDraft[] = [];
    const snapshot = await runBaseline(input(), {
      clock: new ImmediateClock(),
      transport: { execute: async () => success() },
      telemetry: telemetry(events),
      signal: controller.signal,
    });
    expect(events.filter(({ kind }) => kind.startsWith("attempt-"))).toEqual(
      [],
    );
    expect(snapshot.operations[0]?.attemptCount).toBe(0);
  });
});
