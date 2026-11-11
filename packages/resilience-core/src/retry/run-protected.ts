import {
  SuccessBodySchema,
  type Outcome,
  type TraceEventDraft,
} from "@frp/contracts";
import type {
  BaselineDependencies,
  BaselineRunInput,
  LogicalOperationResult,
  RunSnapshot,
} from "../baseline/run-baseline.js";
import { SyntheticTransportError } from "../ports/transport.port.js";

export interface RandomSource {
  next(): number;
  fork?(key: string): RandomSource;
}
export interface RetryPolicy {
  budgetMs: number;
  maxAttempts: number;
  baseDelayMs: number;
  capMs: number;
  jitter: "none" | "full";
}
export const defaultRetryPolicy: Readonly<RetryPolicy> = Object.freeze({
  budgetMs: 1500,
  maxAttempts: 3,
  baseDelayMs: 200,
  capMs: 2000,
  jitter: "full",
});

export function createSeededRandom(seed: string): RandomSource {
  let state = 2166136261;
  for (const char of seed)
    state = Math.imul(state ^ char.charCodeAt(0), 16777619);
  return {
    next() {
      state = (state + 0x6d2b79f5) | 0;
      let value = Math.imul(state ^ (state >>> 15), state | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    },
    fork: (key) => createSeededRandom(`${seed}|${key}`),
  };
}

function validatePolicy(policy: RetryPolicy): void {
  if (
    !Number.isFinite(policy.budgetMs) ||
    policy.budgetMs < 100 ||
    policy.budgetMs > 10000 ||
    !Number.isInteger(policy.maxAttempts) ||
    policy.maxAttempts < 1 ||
    policy.maxAttempts > 5 ||
    !Number.isFinite(policy.baseDelayMs) ||
    policy.baseDelayMs < 0 ||
    policy.baseDelayMs > 2000 ||
    !Number.isFinite(policy.capMs) ||
    policy.capMs < policy.baseDelayMs ||
    policy.capMs > 10000 ||
    !["none", "full"].includes(policy.jitter)
  )
    throw new RangeError("Invalid retry policy bounds");
}

// Retry-After delta seconds only: HTTP dates require a separate wall-clock port.
function retryAfter(
  headers: Record<string, string>,
  statusCode: number,
): number | null {
  if (statusCode !== 429 && statusCode !== 503) return null;
  const value = Object.entries(headers)
    .find(([key]) => key.toLowerCase() === "retry-after")?.[1]
    ?.trim();
  if (!value || !/^\d+$/.test(value)) return null;
  const seconds = Number(value);
  return Number.isSafeInteger(seconds) && seconds <= 60 ? seconds * 1000 : null;
}

async function cancellable<T>(
  work: () => Promise<T>,
  signal: AbortSignal,
): Promise<T> {
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
  let abort: () => void = () => {};
  const cancelled = new Promise<never>((_resolve, reject) => {
    abort = () => reject(new DOMException("Aborted", "AbortError"));
    signal.addEventListener("abort", abort, { once: true });
  });
  try {
    return await Promise.race([work(), cancelled]);
  } finally {
    signal.removeEventListener("abort", abort);
  }
}

export async function runProtected(
  input: BaselineRunInput,
  dependencies: BaselineDependencies & { random: RandomSource },
  policy: RetryPolicy = defaultRetryPolicy,
): Promise<RunSnapshot> {
  validatePolicy(policy);
  const { clock, signal, transport, telemetry } = dependencies;
  const startedAtMs = clock.now();
  const emit = (
    event: Omit<TraceEventDraft, "schemaVersion" | "runId" | "side" | "atMs">,
  ) =>
    telemetry.emit({
      schemaVersion: 1,
      runId: input.runId,
      side: "protected",
      atMs: Math.max(0, clock.now() - startedAtMs),
      ...event,
    });
  emit({ kind: "run-started", operationId: "run" });
  const operations = await Promise.all(
    input.operations.map(async (operation): Promise<LogicalOperationResult> => {
      let attemptCount = 0;
      let admittedAt = clock.now();
      let outcome: Outcome = "abort";
      let statusCode: number | undefined;
      let activeAttempt = false;
      let attemptAt = 0;
      let expired = false;
      const controller = new AbortController();
      const timerController = new AbortController();
      const callerAbort = () => controller.abort();
      signal.addEventListener("abort", callerAbort, { once: true });
      if (signal.aborted) controller.abort();
      const random =
        dependencies.random.fork?.(operation.operationId) ??
        dependencies.random;
      try {
        await cancellable(
          () => clock.sleep(operation.arrivalAtMs, controller.signal),
          controller.signal,
        );
        admittedAt = clock.now();
        const deadline = admittedAt + policy.budgetMs;
        emit({
          kind: "logical-operation-started",
          operationId: operation.operationId,
        });
        const expire = () => {
          if (expired || signal.aborted) return;
          expired = true;
          emit({
            kind: "timeout-deadline",
            operationId: operation.operationId,
            details: { budgetMs: policy.budgetMs, remainingMs: 0 },
          });
          controller.abort();
        };
        void clock
          .sleep(policy.budgetMs, timerController.signal)
          .then(expire, () => {});
        const eligible =
          operation.logicalMethod === "GET" &&
          (operation.classification === "read" ||
            operation.classification === "polling") &&
          operation.endpoint === "catalog";
        for (let index = 0; index < policy.maxAttempts; index++) {
          if (clock.now() >= deadline) expire();
          if (controller.signal.aborted) {
            outcome = signal.aborted ? "abort" : "timeout";
            break;
          }
          attemptAt = clock.now();
          activeAttempt = true;
          attemptCount++;
          emit({
            kind: "attempt-started",
            operationId: operation.operationId,
            attemptIndex: index,
            details: { remainingMs: deadline - clock.now() },
          });
          let delayHeader: number | null = null;
          try {
            const response = await cancellable(
              () =>
                transport.execute(
                  {
                    schemaVersion: 1,
                    scenarioId: input.scenarioId,
                    seed: input.seed,
                    runId: input.runId,
                    operationId: operation.operationId,
                    operationOrdinal: operation.operationOrdinal,
                    attemptIndex: index,
                    endpoint: operation.endpoint,
                    classification: operation.classification,
                    logicalMethod: operation.logicalMethod,
                  },
                  controller.signal,
                ),
              controller.signal,
            );
            if (clock.now() >= deadline) expire();
            if (controller.signal.aborted)
              throw new DOMException("Aborted", "AbortError");
            statusCode = response.statusCode;
            outcome =
              statusCode === 429
                ? "http-429"
                : statusCode >= 500
                  ? "http-5xx"
                  : statusCode >= 300
                    ? "http-other"
                    : statusCode >= 200 &&
                        SuccessBodySchema.safeParse(response.body).success
                      ? "success"
                      : "invalid-payload";
            delayHeader = retryAfter(response.headers, statusCode);
          } catch (error) {
            if (clock.now() >= deadline) expire();
            if (controller.signal.aborted) throw error;
            statusCode = undefined;
            outcome =
              error instanceof SyntheticTransportError
                ? error.outcome
                : "network-error";
          }
          activeAttempt = false;
          emit({
            kind: "attempt-finished",
            operationId: operation.operationId,
            attemptIndex: index,
            outcome,
            ...(statusCode === undefined ? {} : { statusCode }),
            durationMs: Math.max(0, clock.now() - attemptAt),
          });
          const transient =
            outcome === "network-error" ||
            outcome === "timeout" ||
            statusCode === 429 ||
            statusCode === 500 ||
            statusCode === 502 ||
            statusCode === 503 ||
            statusCode === 504;
          if (!eligible || !transient || index + 1 >= policy.maxAttempts) break;
          const cap = Math.min(policy.capMs, policy.baseDelayMs * 2 ** index);
          const draw = policy.jitter === "full" ? random.next() : 1;
          if (!Number.isFinite(draw) || draw < 0 || draw > 1)
            throw new RangeError("Random source must produce values in [0,1]");
          const backoff = cap * draw;
          const delayMs = Math.max(backoff, delayHeader ?? 0);
          const remainingMs = Math.max(0, deadline - clock.now());
          emit({
            kind: "retry-scheduled",
            operationId: operation.operationId,
            attemptIndex: index,
            outcome,
            details: {
              delayMs,
              remainingMs,
              delaySource:
                delayHeader !== null && delayHeader >= backoff
                  ? "retry-after"
                  : policy.jitter === "full"
                    ? "full-jitter"
                    : "exponential",
            },
          });
          await cancellable(
            () =>
              clock.sleep(Math.min(delayMs, remainingMs), controller.signal),
            controller.signal,
          );
          if (clock.now() >= deadline) {
            expire();
            outcome = signal.aborted ? "abort" : "timeout";
            break;
          }
        }
      } catch (error) {
        if (!controller.signal.aborted) throw error;
        outcome = signal.aborted ? "abort" : expired ? "timeout" : "abort";
        if (activeAttempt)
          emit({
            kind: outcome === "abort" ? "attempt-aborted" : "attempt-finished",
            operationId: operation.operationId,
            attemptIndex: attemptCount - 1,
            outcome,
            durationMs: Math.max(0, clock.now() - attemptAt),
          });
      } finally {
        timerController.abort();
        controller.abort();
        signal.removeEventListener("abort", callerAbort);
      }
      const durationMs = Math.max(0, clock.now() - admittedAt);
      emit({
        kind: "logical-operation-finished",
        operationId: operation.operationId,
        outcome,
        durationMs,
        ...(statusCode === undefined ? {} : { statusCode }),
      });
      return Object.freeze({
        operationId: operation.operationId,
        outcome,
        durationMs,
        attemptCount,
        ...(statusCode === undefined ? {} : { statusCode }),
      });
    }),
  );
  emit({
    kind: signal.aborted ? "run-cancelled" : "run-finished",
    operationId: "run",
  });
  return Object.freeze({
    runId: input.runId,
    status: signal.aborted ? "cancelled" : "completed",
    startedAtMs,
    completedAtMs: clock.now(),
    operations: Object.freeze(operations),
  });
}
