import type { TraceEvent } from '@frp/contracts';

export interface RatioMetric {
  numerator: number;
  denominator: number;
  ratio: number | null;
}

export interface RunMetrics {
  logicalSuccessRate: RatioMetric;
  upstreamErrorRate: RatioMetric;
  upstreamAttempts: number;
  upstreamAborted: number;
  p50LatencyMs: number | null;
  p95LatencyMs: number | null;
  retryAmplification: number | null;
  policyRejected: number;
}

export function nearestRank(samples: readonly number[], percentile: number): number | null {
  if (samples.length === 0) return null;
  if (!Number.isFinite(percentile) || percentile <= 0 || percentile > 1) {
    throw new RangeError('percentile must be greater than 0 and at most 1');
  }
  const sorted = [...samples].sort((left, right) => left - right);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(percentile * sorted.length) - 1));
  return sorted[index] ?? null;
}

function ratio(numerator: number, denominator: number): RatioMetric {
  return { numerator, denominator, ratio: denominator === 0 ? null : numerator / denominator };
}

export function projectMetrics(events: readonly TraceEvent[]): RunMetrics {
  const logicalStarted = events.filter(({ kind }) => kind === 'logical-operation-started').length;
  const logicalFinished = events.filter(
    ({ kind, outcome }) => kind === 'logical-operation-finished' && outcome !== 'abort',
  );
  const logicalSucceeded = logicalFinished.filter(({ outcome }) => outcome === 'success').length;
  const attempts = events.filter(({ kind }) => kind === 'attempt-started').length;
  const finishedAttempts = events.filter(({ kind }) => kind === 'attempt-finished');
  const upstreamAborted = events.filter(({ kind }) => kind === 'attempt-aborted').length;
  const failedAttempts = finishedAttempts.filter(({ outcome }) => outcome !== 'success').length;
  const durations = logicalFinished.flatMap(({ durationMs }) => (durationMs === undefined ? [] : [durationMs]));
  const policyRejected = logicalFinished.filter(({ outcome }) => outcome === 'rejected-by-policy').length;
  return {
    logicalSuccessRate: ratio(logicalSucceeded, logicalFinished.length),
    upstreamErrorRate: ratio(failedAttempts, finishedAttempts.length),
    upstreamAttempts: attempts,
    upstreamAborted,
    p50LatencyMs: nearestRank(durations, 0.5),
    p95LatencyMs: nearestRank(durations, 0.95),
    retryAmplification: logicalStarted === 0 ? null : attempts / logicalStarted,
    policyRejected,
  };
}
