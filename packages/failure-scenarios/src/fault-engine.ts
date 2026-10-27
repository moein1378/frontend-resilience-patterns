import type { FaultProfile, Scenario, Workload } from '@frp/contracts';

export type PlannedOperation = Readonly<{
  scenarioId: string;
  seed: string;
  workloadId: string;
  operationId: string;
  operationOrdinal: number;
  arrivalAtMs: number;
  endpoint: 'catalog' | 'synthetic-mutation';
  classification: 'read' | 'safe-mutation' | 'unsafe-mutation' | 'polling';
  logicalMethod: 'GET' | 'POST';
}>;

export type FaultDecision = Readonly<{
  kind: 'success' | 'http-error' | 'disconnect' | 'malformed';
  latencyMs: number;
  statusCode: number;
  retryable: boolean;
  retryAfterSeconds?: number;
  syntheticId: string;
}>;

export function hash32(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function randomUnit(seed: number): number {
  let value = (seed + 0x6d2b79f5) >>> 0;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
}

export function buildWorkloadPlan(scenario: Scenario, workload: Workload): readonly PlannedOperation[] {
  if (scenario.workloadId !== workload.id) throw new Error(`Scenario ${scenario.id} requires workload ${scenario.workloadId}`);
  const operations = workload.operations.map((operation, operationOrdinal) =>
    Object.freeze({
      scenarioId: scenario.id,
      seed: scenario.seed,
      workloadId: workload.id,
      operationId: operation.id,
      operationOrdinal,
      arrivalAtMs: operation.arrivalAtMs,
      endpoint: operation.endpoint,
      classification: workload.classification,
      logicalMethod: workload.logicalMethod,
    }),
  );
  return Object.freeze(operations);
}

function sequenceValue<T>(values: readonly T[], ordinal: number, fallback: T): T {
  return values.length === 0 ? fallback : (values[ordinal % values.length] ?? fallback);
}

export function faultFor(input: {
  scenarioSeed: string;
  scenarioId: string;
  operationId: string;
  operationOrdinal: number;
  attemptIndex: number;
  endpoint: string;
  profile: FaultProfile;
}): FaultDecision {
  const scheduleIndex = input.operationOrdinal + input.attemptIndex;
  const latencyMs = input.profile.latencySequenceMs
    ? sequenceValue(input.profile.latencySequenceMs, scheduleIndex, 0)
    : (input.profile.latencyMs ?? 0);
  const configuredStatus = sequenceValue(input.profile.statusSequence, scheduleIndex, 200);
  const probabilitySeed = hash32(
    `${input.scenarioSeed}|${input.scenarioId}|${input.operationId}|attempt:${input.attemptIndex}|endpoint:${input.endpoint}`,
  );
  const probabilityAllowsFault =
    input.profile.mode !== 'seeded-probability' || randomUnit(probabilitySeed) < (input.profile.probability ?? 0);
  const statusCode = probabilityAllowsFault ? configuredStatus : 200;
  const disconnect = probabilityAllowsFault && input.profile.disconnectAttempts.includes(input.attemptIndex);
  const malformed = probabilityAllowsFault && input.profile.malformedAttempts.includes(input.attemptIndex);
  const kind = disconnect ? 'disconnect' : malformed ? 'malformed' : statusCode >= 400 ? 'http-error' : 'success';
  const retryable = disconnect || statusCode === 429 || statusCode >= 500;
  const base = {
    kind,
    latencyMs,
    statusCode: disconnect ? 0 : statusCode,
    retryable,
    syntheticId: `item-${hash32(`${input.scenarioSeed}|${input.operationId}`)}`,
  } as const;
  return input.profile.retryAfterSeconds === undefined
    ? base
    : { ...base, retryAfterSeconds: input.profile.retryAfterSeconds };
}
