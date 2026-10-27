import { reactive } from 'vue';
import type { TraceEvent } from '@frp/contracts';
import { buildWorkloadPlan, findScenario, findWorkload } from '@frp/failure-scenarios';
import {
  runBaseline,
  SystemClock,
  type Clock,
  type RunSnapshot,
  type Transport,
} from '@frp/resilience-core';
import { createTelemetryCollector, projectMetrics, type RunMetrics } from '@frp/telemetry';
import { createFixtureTransport } from './adapters/fixture-transport.adapter.js';
import { createHttpTransport } from './adapters/http-transport.adapter.js';

export type RuntimeMode = 'fixture' | 'local';
export type RunStatus = 'idle' | 'running' | 'completed' | 'cancelled' | 'error';

export interface ExperimentState {
  selectedScenarioId: string;
  seed: string;
  mode: RuntimeMode;
  status: RunStatus;
  snapshot: RunSnapshot | null;
  events: readonly TraceEvent[];
  metrics: RunMetrics | null;
  error: string | null;
  truncatedEvents: number;
}

export interface ExperimentStoreDependencies {
  clockFactory: () => Clock;
  fixtureTransportFactory: (clock: Clock) => Transport;
  localTransportFactory: () => Transport;
}

export interface ExperimentStore {
  state: ExperimentState;
  run(): Promise<void>;
  reset(): void;
}

const defaultDependencies: ExperimentStoreDependencies = {
  clockFactory: () => new SystemClock(),
  fixtureTransportFactory: (clock) => createFixtureTransport({ clock }),
  localTransportFactory: () =>
    createHttpTransport({ baseUrl: import.meta.env.VITE_CHAOS_API_URL || 'http://localhost:3001' }),
};

export function createExperimentStore(
  dependencies: ExperimentStoreDependencies = defaultDependencies,
): ExperimentStore {
  const state = reactive<ExperimentState>({
    selectedScenarioId: 'intermittent-503',
    seed: 'resilience-v1',
    mode: 'fixture',
    status: 'idle',
    snapshot: null,
    events: [],
    metrics: null,
    error: null,
    truncatedEvents: 0,
  });
  let generation = 0;
  let activeController: AbortController | null = null;

  function reset(): void {
    generation += 1;
    activeController?.abort();
    activeController = null;
    state.status = 'idle';
    state.snapshot = null;
    state.events = [];
    state.metrics = null;
    state.error = null;
    state.truncatedEvents = 0;
  }

  async function run(): Promise<void> {
    generation += 1;
    const currentGeneration = generation;
    activeController?.abort();
    const controller = new AbortController();
    activeController = controller;
    state.status = 'running';
    state.snapshot = null;
    state.events = [];
    state.metrics = null;
    state.error = null;
    state.truncatedEvents = 0;

    const scenario = findScenario(state.selectedScenarioId);
    const workload = scenario ? findWorkload(scenario.workloadId) : undefined;
    if (!scenario || !workload) {
      if (currentGeneration === generation) {
        state.status = 'error';
        state.error =
          'The selected scenario or workload is unavailable. Reset to the built-in catalog.';
      }
      return;
    }

    const clock = dependencies.clockFactory();
    const collector = createTelemetryCollector();
    try {
      const snapshot = await runBaseline(
        {
          runId: `run-${currentGeneration}`,
          scenarioId: scenario.id,
          seed: state.seed,
          operations: buildWorkloadPlan({ ...scenario, seed: state.seed }, workload),
        },
        {
          clock,
          transport:
            state.mode === 'fixture'
              ? dependencies.fixtureTransportFactory(clock)
              : dependencies.localTransportFactory(),
          telemetry: collector,
          signal: controller.signal,
        },
      );
      if (currentGeneration !== generation) return;
      const events = collector.events();
      state.snapshot = snapshot;
      state.events = events;
      state.metrics = projectMetrics(events);
      state.truncatedEvents = collector.truncatedCount();
      if (snapshot.status === 'cancelled') state.status = 'cancelled';
      else if (
        state.mode === 'local' &&
        snapshot.operations.every(({ outcome }) => outcome === 'network-error')
      ) {
        state.status = 'error';
        state.error =
          'Local chaos API is unavailable. Start pnpm dev:all or switch Runtime mode to Fixture.';
      } else state.status = 'completed';
    } catch (error) {
      if (currentGeneration !== generation) return;
      state.status = controller.signal.aborted ? 'cancelled' : 'error';
      state.error =
        state.mode === 'local'
          ? 'Local chaos API is unavailable. Start pnpm dev:all or switch Runtime mode to Fixture.'
          : error instanceof Error
            ? error.message
            : 'The synthetic run failed safely. Reset and replay the fixture.';
    } finally {
      if (currentGeneration === generation) activeController = null;
    }
  }

  return { state, run, reset };
}

const experimentStore = createExperimentStore();

export function useExperimentStore(): ExperimentStore {
  return experimentStore;
}
