import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AttemptResponse, TraceEventDraft } from "@frp/contracts";
import { runProtected, createSeededRandom } from "./run-protected.js";
import {
  SystemClock,
  type BaselineRunInput,
  type Transport,
} from "../index.js";

const input: BaselineRunInput = {
  runId: "run-test",
  scenarioId: "test",
  seed: "test",
  operations: [
    {
      operationId: "read-1",
      operationOrdinal: 0,
      arrivalAtMs: 0,
      endpoint: "catalog",
      classification: "read",
      logicalMethod: "GET",
    },
  ],
};
const ok: AttemptResponse = {
  statusCode: 200,
  headers: {},
  body: {
    schemaVersion: 1,
    operationId: "read-1",
    attemptIndex: 0,
    syntheticData: { itemId: "item-1", label: "Item" },
    generatedAtOffsetMs: 0,
    source: "fixture",
  },
};
const unavailable: AttemptResponse = { statusCode: 503, headers: {}, body: {} };
function setup(transport: Transport, controller = new AbortController()) {
  const events: TraceEventDraft[] = [];
  return {
    events,
    deps: {
      clock: new SystemClock(),
      transport,
      signal: controller.signal,
      telemetry: { emit: (event: TraceEventDraft) => events.push(event) },
      random: { next: () => 0.5 },
    },
  };
}
describe("protected shared budget and retries", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  it("recovers transient reads and includes backoff in logical duration", async () => {
    let count = 0;
    const { events, deps } = setup({
      execute: async () => (++count === 1 ? unavailable : ok),
    });
    const pending = runProtected(input, deps);
    await vi.runAllTimersAsync();
    const result = await pending;
    expect(result.operations[0]).toMatchObject({
      outcome: "success",
      attemptCount: 2,
      durationMs: 100,
    });
    expect(
      events.filter((e) => e.kind === "logical-operation-finished"),
    ).toHaveLength(1);
    expect(
      events.find((e) => e.kind === "retry-scheduled")?.details,
    ).toMatchObject({ delayMs: 100, remainingMs: 1500 });
    expect(vi.getTimerCount()).toBe(0);
  });
  it("exhausts at the configured total attempt count", async () => {
    const { deps } = setup({ execute: async () => unavailable });
    const pending = runProtected(input, deps);
    await vi.runAllTimersAsync();
    expect((await pending).operations[0]).toMatchObject({
      outcome: "http-5xx",
      attemptCount: 3,
    });
  });
  it.each(["unsafe-mutation", "safe-mutation"] as const)(
    "never retries %s without deduplication",
    async (classification) => {
      const { deps } = setup({ execute: async () => unavailable });
      const pending = runProtected(
        {
          ...input,
          operations: input.operations.map((op) => ({
            ...op,
            classification,
            logicalMethod: "POST",
          })),
        },
        deps,
      );
      await vi.runAllTimersAsync();
      expect((await pending).operations[0]?.attemptCount).toBe(1);
    },
  );
  it.each([400, 401, 403, 404, 501, 505, 200])(
    "does not retry permanent status or malformed body %s",
    async (statusCode) => {
      const { deps } = setup({
        execute: async () => ({ ...unavailable, statusCode }),
      });
      const pending = runProtected(input, deps);
      await vi.runAllTimersAsync();
      expect((await pending).operations[0]?.attemptCount).toBe(1);
    },
  );
  it("deadline aborts and settles even if the transport ignores its signal", async () => {
    let signal: AbortSignal | undefined;
    const { events, deps } = setup({
      execute: (_r, s) => {
        signal = s;
        return new Promise(() => {});
      },
    });
    const pending = runProtected(input, deps);
    await vi.runAllTimersAsync();
    expect((await pending).operations[0]).toMatchObject({
      outcome: "timeout",
      attemptCount: 1,
      durationMs: 1500,
    });
    expect(signal?.aborted).toBe(true);
    expect(events.filter((e) => e.kind === "timeout-deadline")).toHaveLength(1);
  });
  it("cancels backoff without a further physical attempt", async () => {
    const controller = new AbortController();
    let count = 0;
    const { deps } = setup(
      {
        execute: async () => {
          count++;
          return unavailable;
        },
      },
      controller,
    );
    const pending = runProtected(input, deps);
    await vi.advanceTimersByTimeAsync(1);
    controller.abort();
    await vi.runAllTimersAsync();
    expect((await pending).operations[0]?.outcome).toBe("abort");
    expect(count).toBe(1);
    expect(vi.getTimerCount()).toBe(0);
  });
  it("does not retry before Retry-After when it exceeds the remaining budget", async () => {
    const { deps } = setup({
      execute: async () => ({
        ...unavailable,
        headers: { "retry-after": "2" },
      }),
    });
    const pending = runProtected(input, deps);
    await vi.runAllTimersAsync();
    expect((await pending).operations[0]).toMatchObject({
      outcome: "timeout",
      attemptCount: 1,
      durationMs: 1500,
    });
  });
  it.each([
    "-1",
    "broken",
    "999999999999999999",
    "Wed, 21 Oct 2015 07:28:00 GMT",
  ])("ignores unsupported Retry-After %s", async (value) => {
    let count = 0;
    const { deps } = setup({
      execute: async () =>
        ++count === 1
          ? { ...unavailable, headers: { "Retry-After": value } }
          : ok,
    });
    const pending = runProtected(input, deps);
    await vi.runAllTimersAsync();
    expect((await pending).operations[0]).toMatchObject({
      outcome: "success",
      durationMs: 100,
      attemptCount: 2,
    });
  });
  it("respects valid Retry-After as a minimum delay", async () => {
    let count = 0;
    const { deps } = setup({
      execute: async () =>
        ++count === 1
          ? { ...unavailable, headers: { "Retry-After": "1" } }
          : ok,
    });
    const pending = runProtected(input, deps);
    await vi.runAllTimersAsync();
    expect((await pending).operations[0]).toMatchObject({
      outcome: "success",
      durationMs: 1000,
      attemptCount: 2,
    });
  });
  it("ignores transport success arriving after deadline", async () => {
    let resolve!: (response: AttemptResponse) => void;
    const { events, deps } = setup({
      execute: () =>
        new Promise((r) => {
          resolve = r;
        }),
    });
    const pending = runProtected(input, deps);
    await vi.runAllTimersAsync();
    const result = await pending;
    resolve(ok);
    await Promise.resolve();
    expect(result.operations[0]?.outcome).toBe("timeout");
    expect(
      events.filter((e) => e.kind === "logical-operation-finished"),
    ).toHaveLength(1);
    expect(events.some((e) => e.outcome === "success")).toBe(false);
  });
  it("does not start transport after cancellation before admission", async () => {
    const controller = new AbortController();
    controller.abort();
    let count = 0;
    const { deps } = setup(
      {
        execute: async () => {
          count++;
          return ok;
        },
      },
      controller,
    );
    expect((await runProtected(input, deps)).operations[0]?.attemptCount).toBe(
      0,
    );
    expect(count).toBe(0);
  });
  it("rejects invalid policy before transport work", async () => {
    const { deps } = setup({ execute: async () => ok });
    await expect(
      runProtected(input, deps, {
        budgetMs: 0,
        maxAttempts: 6,
        baseDelayMs: 200,
        capMs: 2000,
        jitter: "full",
      }),
    ).rejects.toThrow(RangeError);
  });
  it("replays bounded seeded random streams", () => {
    const a = createSeededRandom("a"),
      b = createSeededRandom("a"),
      c = createSeededRandom("b");
    const values = Array.from({ length: 20 }, () => a.next());
    expect(values).toEqual(Array.from({ length: 20 }, () => b.next()));
    expect(values).not.toEqual(Array.from({ length: 20 }, () => c.next()));
    expect(values.every((v) => v >= 0 && v < 1)).toBe(true);
  });
});

it("rejects success past the absolute deadline even before the timer callback runs", async () => {
  vi.useFakeTimers();
  try {
    let offset = 0;
    const { deps } = setup({
      execute: async () => {
        offset = 1500;
        return ok;
      },
    });
    const clock = new SystemClock();
    const dependencies = {
      ...deps,
      clock: {
        now: () => clock.now() + offset,
        sleep: (ms: number, signal?: AbortSignal) => clock.sleep(ms, signal),
      },
    };
    const pending = runProtected(input, dependencies);
    await vi.advanceTimersByTimeAsync(0);
    expect((await pending).operations[0]).toMatchObject({
      outcome: "timeout",
      attemptCount: 1,
    });
  } finally {
    vi.useRealTimers();
  }
});
