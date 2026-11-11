import { reactive } from 'vue';
import type { TraceEvent } from '@frp/contracts';
import { buildWorkloadPlan, findScenario, findWorkload } from '@frp/failure-scenarios';
import {
  createSeededRandom,
  runBaseline,
  runProtected,
  SystemClock,
  type RetryPolicy,
  type RunSnapshot,
} from '@frp/resilience-core';
import { createTelemetryCollector, projectMetrics, type RunMetrics } from '@frp/telemetry';
import { createFixtureTransport } from './adapters/fixture-transport.adapter.js';
import { createHttpTransport } from './adapters/http-transport.adapter.js';

export interface ComparisonResult {
  label: string;
  snapshot: RunSnapshot;
  events: readonly TraceEvent[];
  metrics: RunMetrics;
  truncatedEvents: number;
}

interface ComparisonInput {
  scenarioId: string;
  seed: string;
  mode: 'fixture' | 'local';
  policy: RetryPolicy;
}
interface ComparisonState {
  selectedScenarioId: string;
  seed: string;
  mode: ComparisonInput['mode'];
  status: 'idle' | 'running' | 'completed' | 'cancelled' | 'error';
  error: string | null;
  policy: RetryPolicy;
  results: ComparisonResult[];
  completedInput: ComparisonInput | null;
}

export function createRetryComparisonStore() {
  const state = reactive<ComparisonState>({
    selectedScenarioId: 'intermittent-503',
    seed: 'resilience-v1',
    mode: 'fixture',
    status: 'idle',
    error: null,
    policy: {
      budgetMs: 1500,
      maxAttempts: 3,
      baseDelayMs: 200,
      capMs: 2000,
      jitter: 'full',
    },
    results: [],
    completedInput: null,
  });
  let generation = 0;
  let activeController: AbortController | null = null;

  function reset() {
    generation += 1;
    activeController?.abort();
    activeController = null;
    state.results = [];
    state.completedInput = null;
    state.error = null;
    state.status = 'idle';
  }

  function cancel() {
    activeController?.abort();
  }

  async function run() {
    reset();
    const currentGeneration = generation;
    const policy = { ...state.policy };
    const scenario = findScenario(state.selectedScenarioId);
    const workload = scenario && findWorkload(scenario.workloadId);
    const bounded = (value: number, min: number, max: number) =>
      Number.isInteger(value) && value >= min && value <= max;
    if (
      !scenario ||
      !workload ||
      !state.seed.trim() ||
      state.seed.length > 120 ||
      !bounded(policy.budgetMs, 100, 10000) ||
      !bounded(policy.maxAttempts, 1, 5) ||
      !bounded(policy.baseDelayMs, 0, 2000) ||
      !bounded(policy.capMs, policy.baseDelayMs, 10000)
    ) {
      state.status = 'error';
      state.error =
        'Choose a scenario, a replay seed, and policy values within the displayed bounds.';
      return;
    }
    const mode = state.mode;
    const seed = state.seed;
    const operations = buildWorkloadPlan({ ...scenario, seed }, workload);
    const controller = new AbortController();
    activeController = controller;
    state.status = 'running';
    try {
      const results = await Promise.all(
        ['Baseline · one attempt', 'Synchronized retries', 'Full jitter'].map(
          async (label, index): Promise<ComparisonResult> => {
            const clock = new SystemClock();
            const collector = createTelemetryCollector();
            const dependencies = {
              clock,
              telemetry: collector,
              signal: controller.signal,
              transport:
                mode === 'fixture'
                  ? createFixtureTransport({ clock })
                  : createHttpTransport({
                      baseUrl: import.meta.env.VITE_CHAOS_API_URL || 'http://localhost:3001',
                    }),
              random: createSeededRandom(seed),
            };
            const input = {
              runId: `comparison-${currentGeneration}-${index}`,
              scenarioId: scenario.id,
              seed,
              operations,
            };
            const snapshot =
              index === 0
                ? await runBaseline(input, dependencies)
                : await runProtected(input, dependencies, {
                    ...policy,
                    jitter: index === 1 ? 'none' : 'full',
                  });
            const events = collector.events();
            return {
              label,
              snapshot,
              events,
              metrics: projectMetrics(events),
              truncatedEvents: collector.truncatedCount(),
            };
          },
        ),
      );
      if (generation !== currentGeneration) return;
      state.results = results;
      state.completedInput = { scenarioId: scenario.id, seed, mode, policy };
      state.status = controller.signal.aborted ? 'cancelled' : 'completed';
      if (
        mode === 'local' &&
        results.every(({ snapshot }) =>
          snapshot.operations.every(({ outcome }) => outcome === 'network-error'),
        )
      ) {
        state.status = 'error';
        state.error = 'Local chaos API is unavailable. Start pnpm dev:all or switch to Fixture.';
      }
    } catch (error) {
      if (generation !== currentGeneration) return;
      controller.abort();
      state.status = 'error';
      state.error = error instanceof Error ? error.message : 'Comparison failed. Reset and replay.';
    } finally {
      if (generation === currentGeneration) activeController = null;
    }
  }

  return { state, run, reset, cancel };
}
