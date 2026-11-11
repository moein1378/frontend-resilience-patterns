import {
  SuccessBodySchema,
  type AttemptRequest,
  type Outcome,
} from "@frp/contracts";
import type { Clock } from "../ports/clock.port.js";
import {
  SyntheticTransportError,
  type TelemetrySink,
  type Transport,
} from "../ports/transport.port.js";

export interface BaselineOperation {
  operationId: string;
  operationOrdinal: number;
  arrivalAtMs: number;
  endpoint: "catalog" | "synthetic-mutation";
  classification: "read" | "safe-mutation" | "unsafe-mutation" | "polling";
  logicalMethod: "GET" | "POST";
}

export interface BaselineRunInput {
  runId: string;
  scenarioId: string;
  seed: string;
  operations: readonly BaselineOperation[];
}

export interface LogicalOperationResult {
  operationId: string;
  outcome: Outcome;
  statusCode?: number;
  durationMs: number;
  attemptCount: number;
}

export interface RunSnapshot {
  runId: string;
  status: "completed" | "cancelled";
  startedAtMs: number;
  completedAtMs: number;
  operations: readonly LogicalOperationResult[];
}

export interface BaselineDependencies {
  clock: Clock;
  transport: Transport;
  telemetry: TelemetrySink;
  signal: AbortSignal;
}

function classifyStatus(statusCode: number): Outcome {
  if (statusCode === 429) return "http-429";
  if (statusCode >= 500) return "http-5xx";
  if (statusCode >= 400) return "http-other";
  return "success";
}

function classifyError(error: unknown, signal: AbortSignal): Outcome {
  if (
    signal.aborted ||
    (error instanceof DOMException && error.name === "AbortError")
  )
    return "abort";
  if (error instanceof SyntheticTransportError) return error.outcome;
  return "network-error";
}

export async function runBaseline(
  input: BaselineRunInput,
  dependencies: BaselineDependencies,
): Promise<RunSnapshot> {
  const { clock, signal, telemetry, transport } = dependencies;
  const startedAtMs = clock.now();
  const relativeNow = () => Math.max(0, clock.now() - startedAtMs);
  telemetry.emit({
    schemaVersion: 1,
    runId: input.runId,
    side: "baseline",
    atMs: 0,
    kind: "run-started",
    operationId: "run",
  });

  const results = await Promise.all(
    input.operations.map(async (operation): Promise<LogicalOperationResult> => {
      const operationStarted = clock.now();
      let attemptStarted = false;
      try {
        await clock.sleep(operation.arrivalAtMs, signal);
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");
        const admittedAt = clock.now();
        telemetry.emit({
          schemaVersion: 1,
          runId: input.runId,
          side: "baseline",
          atMs: relativeNow(),
          kind: "logical-operation-started",
          operationId: operation.operationId,
        });
        telemetry.emit({
          schemaVersion: 1,
          runId: input.runId,
          side: "baseline",
          atMs: relativeNow(),
          kind: "attempt-started",
          operationId: operation.operationId,
          attemptIndex: 0,
        });
        attemptStarted = true;
        const request: AttemptRequest = {
          schemaVersion: 1,
          scenarioId: input.scenarioId,
          seed: input.seed,
          runId: input.runId,
          operationId: operation.operationId,
          operationOrdinal: operation.operationOrdinal,
          attemptIndex: 0,
          endpoint: operation.endpoint,
          classification: operation.classification,
          logicalMethod: operation.logicalMethod,
        };
        const response = await transport.execute(request, signal);
        let outcome = classifyStatus(response.statusCode);
        if (
          outcome === "success" &&
          !SuccessBodySchema.safeParse(response.body).success
        )
          outcome = "invalid-payload";
        const durationMs = Math.max(0, clock.now() - admittedAt);
        telemetry.emit({
          schemaVersion: 1,
          runId: input.runId,
          side: "baseline",
          atMs: relativeNow(),
          kind: "attempt-finished",
          operationId: operation.operationId,
          attemptIndex: 0,
          outcome,
          statusCode: response.statusCode,
          durationMs,
        });
        telemetry.emit({
          schemaVersion: 1,
          runId: input.runId,
          side: "baseline",
          atMs: relativeNow(),
          kind: "logical-operation-finished",
          operationId: operation.operationId,
          outcome,
          statusCode: response.statusCode,
          durationMs,
        });
        return {
          operationId: operation.operationId,
          outcome,
          statusCode: response.statusCode,
          durationMs,
          attemptCount: 1,
        };
      } catch (error) {
        const outcome = classifyError(error, signal);
        const durationMs = Math.max(0, clock.now() - operationStarted);
        if (attemptStarted) {
          telemetry.emit({
            schemaVersion: 1,
            runId: input.runId,
            side: "baseline",
            atMs: relativeNow(),
            kind: outcome === "abort" ? "attempt-aborted" : "attempt-finished",
            operationId: operation.operationId,
            attemptIndex: 0,
            outcome,
            durationMs,
          });
        }
        telemetry.emit({
          schemaVersion: 1,
          runId: input.runId,
          side: "baseline",
          atMs: relativeNow(),
          kind: "logical-operation-finished",
          operationId: operation.operationId,
          outcome,
          durationMs,
        });
        return {
          operationId: operation.operationId,
          outcome,
          durationMs,
          attemptCount: attemptStarted ? 1 : 0,
        };
      }
    }),
  );

  const cancelled = signal.aborted;
  telemetry.emit({
    schemaVersion: 1,
    runId: input.runId,
    side: "baseline",
    atMs: relativeNow(),
    kind: cancelled ? "run-cancelled" : "run-finished",
    operationId: "run",
  });
  return Object.freeze({
    runId: input.runId,
    status: cancelled ? "cancelled" : "completed",
    startedAtMs,
    completedAtMs: clock.now(),
    operations: Object.freeze(results),
  });
}

export { SyntheticTransportError } from "../ports/transport.port.js";
