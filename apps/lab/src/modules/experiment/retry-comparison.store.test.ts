import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRetryComparisonStore } from './retry-comparison.store.js';

describe('retry comparison lifecycle', () => {
  beforeEach(() => vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] }));
  afterEach(() => vi.useRealTimers());

  it('compares the same fixture and seed with separate retry traces', async () => {
    const store = createRetryComparisonStore();
    const pending = store.run();
    expect(store.state.status).toBe('running');
    await vi.runAllTimersAsync();
    await pending;
    expect(store.state.status).toBe('completed');
    expect(store.state.results).toHaveLength(3);
    expect(store.state.results[0]?.metrics.upstreamAttempts).toBe(5);
    expect(store.state.results[2]?.metrics.upstreamAttempts).toBeGreaterThan(5);
    expect(store.state.results[2]?.events.some(({ kind }) => kind === 'retry-scheduled')).toBe(
      true,
    );
  });

  it('reset aborts pending comparison without allowing late snapshots to commit', async () => {
    const store = createRetryComparisonStore();
    const pending = store.run();
    store.reset();
    await vi.runAllTimersAsync();
    await pending;
    expect(store.state.status).toBe('idle');
    expect(store.state.results).toEqual([]);
  });

  it('rejects invalid controls before starting a comparison', async () => {
    const store = createRetryComparisonStore();
    store.state.policy.maxAttempts = 6;
    await store.run();
    expect(store.state.status).toBe('error');
    expect(store.state.results).toEqual([]);
  });

  it('retains the executed input when controls change after completion', async () => {
    const store = createRetryComparisonStore();
    const pending = store.run();
    await vi.runAllTimersAsync();
    await pending;
    store.state.seed = 'another-seed';
    store.state.policy.budgetMs = 900;
    expect(store.state.completedInput?.seed).toBe('resilience-v1');
    expect(store.state.completedInput?.policy.budgetMs).toBe(1500);
  });

  it('shows fixed versus distributed retry delays for a synchronized burst', async () => {
    const store = createRetryComparisonStore();
    store.state.selectedScenarioId = 'retry-storm';
    const pending = store.run();
    await vi.runAllTimersAsync();
    await pending;
    const synchronized =
      store.state.results[1]?.events.filter(
        ({ kind, attemptIndex }) => kind === 'retry-scheduled' && attemptIndex === 0,
      ) ?? [];
    const jittered =
      store.state.results[2]?.events.filter(
        ({ kind, attemptIndex }) => kind === 'retry-scheduled' && attemptIndex === 0,
      ) ?? [];
    expect(synchronized.length).toBeGreaterThan(1);
    expect(synchronized.every(({ details }) => details?.delayMs === 200)).toBe(true);
    expect(new Set(jittered.map(({ details }) => details?.delayMs)).size).toBeGreaterThan(1);
  });
});
