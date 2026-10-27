import { describe, expect, it } from 'vitest';
import type { AttemptResponse } from '@frp/contracts';
import type { Clock, Transport } from '@frp/resilience-core';
import { createExperimentStore } from './experiment.store.js';

class ImmediateClock implements Clock {
  #now = 0;
  now = () => this.#now;
  sleep(delayMs: number, signal?: AbortSignal) {
    if (signal?.aborted) return Promise.reject(new DOMException('Aborted', 'AbortError'));
    this.#now += delayMs;
    return Promise.resolve();
  }
}

function healthyResponse(operationId: string): AttemptResponse {
  return {
    statusCode: 200,
    headers: {},
    body: {
      schemaVersion: 1,
      operationId,
      attemptIndex: 0,
      syntheticData: { itemId: 'item-1', label: 'Synthetic catalog item' },
      generatedAtOffsetMs: 10,
      source: 'fixture',
    },
  };
}

describe('experiment store lifecycle', () => {
  it('moves from idle through running to a completed fixture snapshot', async () => {
    const store = createExperimentStore({
      clockFactory: () => new ImmediateClock(),
      fixtureTransportFactory: () => ({
        execute: ({ operationId }) => Promise.resolve(healthyResponse(operationId)),
      }),
      localTransportFactory: () => ({
        execute: ({ operationId }) => Promise.resolve(healthyResponse(operationId)),
      }),
    });
    store.state.selectedScenarioId = 'healthy-baseline';
    const run = store.run();
    expect(store.state.status).toBe('running');
    await run;
    expect(store.state.status).toBe('completed');
    expect(store.state.snapshot?.operations).toHaveLength(5);
    expect(store.state.metrics?.logicalSuccessRate.ratio).toBe(1);
  });

  it('shows an actionable recovery message when local mode is unavailable', async () => {
    const unavailable: Transport = {
      execute: async () => Promise.reject(new Error('connect ECONNREFUSED')),
    };
    const store = createExperimentStore({
      clockFactory: () => new ImmediateClock(),
      fixtureTransportFactory: () => unavailable,
      localTransportFactory: () => unavailable,
    });
    store.state.mode = 'local';
    await store.run();
    expect(store.state.status).toBe('error');
    expect(store.state.error).toContain('Local chaos API is unavailable');
    expect(store.state.error).toContain('Fixture');
  });

  it('reset prevents a late result from repopulating the new generation', async () => {
    let release!: (response: AttemptResponse) => void;
    const pending = new Promise<AttemptResponse>((resolve) => {
      release = resolve;
    });
    const store = createExperimentStore({
      clockFactory: () => new ImmediateClock(),
      fixtureTransportFactory: () => ({ execute: async () => pending }),
      localTransportFactory: () => ({ execute: async () => pending }),
    });
    store.state.selectedScenarioId = 'healthy-baseline';
    const run = store.run();
    await Promise.resolve();
    store.reset();
    release(healthyResponse('read-001'));
    await run;
    expect(store.state.status).toBe('idle');
    expect(store.state.snapshot).toBeNull();
    expect(store.state.events).toEqual([]);
    expect(store.state.metrics).toBeNull();
  });
});
