import { describe, expect, it } from 'vitest';
import type { TraceEventDraft } from '@frp/contracts';
import { createTelemetryCollector, nearestRank, projectMetrics } from './index.js';

function event(overrides: Partial<TraceEventDraft>): TraceEventDraft {
  return {
    schemaVersion: 1,
    runId: 'run-a',
    side: 'baseline',
    atMs: 0,
    kind: 'run-started',
    operationId: 'run',
    ...overrides,
  };
}

describe('telemetry projections', () => {
  it('uses nearest-rank percentiles and returns null for no samples', () => {
    expect(nearestRank([100, 200, 300, 400, 500], 0.95)).toBe(500);
    expect(nearestRank([], 0.95)).toBeNull();
  });

  it('derives attempt amplification and logical latency from events', () => {
    const collector = createTelemetryCollector();
    for (let operation = 0; operation < 5; operation += 1) {
      const operationId = `read-00${operation + 1}`;
      collector.emit(event({ kind: 'logical-operation-started', operationId, atMs: operation * 10 }));
      collector.emit(
        event({
          kind: 'logical-operation-finished',
          operationId,
          atMs: operation * 10 + (operation + 1) * 100,
          durationMs: (operation + 1) * 100,
          outcome: 'success',
        }),
      );
    }
    for (let attempt = 0; attempt < 8; attempt += 1) {
      collector.emit(event({ kind: 'attempt-started', operationId: `read-00${(attempt % 5) + 1}`, attemptIndex: 0 }));
    }
    const metrics = projectMetrics(collector.events());
    expect(metrics.logicalSuccessRate).toEqual({ numerator: 5, denominator: 5, ratio: 1 });
    expect(metrics.p95LatencyMs).toBe(500);
    expect(metrics.retryAmplification).toBe(1.6);
    expect(metrics.upstreamAttempts).toBe(8);
  });

  it('represents empty metric samples as null rather than zero', () => {
    const metrics = projectMetrics([]);
    expect(metrics.logicalSuccessRate).toEqual({ numerator: 0, denominator: 0, ratio: null });
    expect(metrics.p50LatencyMs).toBeNull();
    expect(metrics.p95LatencyMs).toBeNull();
    expect(metrics.retryAmplification).toBeNull();
  });

  it('bounds the log, reports truncation, and assigns stable sequence tie-breakers', () => {
    const collector = createTelemetryCollector(2);
    collector.emit(event({ kind: 'run-started', atMs: 0 }));
    collector.emit(event({ kind: 'logical-operation-started', operationId: 'read-001', atMs: 0 }));
    collector.emit(event({ kind: 'attempt-started', operationId: 'read-001', attemptIndex: 0, atMs: 0 }));
    expect(collector.events().map(({ sequence }) => sequence)).toEqual([0, 1]);
    expect(collector.truncatedCount()).toBe(1);
  });
});
