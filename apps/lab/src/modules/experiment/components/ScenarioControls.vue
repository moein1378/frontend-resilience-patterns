<script setup lang="ts">
import { computed } from 'vue';
import { builtInScenarios, findScenario, findWorkload } from '@frp/failure-scenarios';
import { useExperimentStore } from '../experiment.store.js';

const store = useExperimentStore();
const state = store.state;
const scenarioOptions = builtInScenarios.map(({ id, title }) => ({ label: title, value: id }));
const selectedScenario = computed(() => findScenario(state.selectedScenarioId));
const operationCount = computed(() =>
  selectedScenario.value
    ? (findWorkload(selectedScenario.value.workloadId)?.operations.length ?? 0)
    : 0,
);
const statusColor = computed(() =>
  state.status === 'completed'
    ? 'positive'
    : state.status === 'error'
      ? 'negative'
      : state.status === 'running'
        ? 'info'
        : 'grey-6',
);
</script>

<template>
  <section class="controls surface" aria-labelledby="scenario-heading">
    <div class="scenario-banner">
      <div>
        <p class="eyebrow">Active deterministic input</p>
        <h2 id="scenario-heading" class="panel-title">
          {{ selectedScenario?.title ?? 'No scenario' }}
        </h2>
        <p class="scenario-meta mono">
          {{ state.selectedScenarioId }} · {{ state.seed }} · {{ operationCount }} logical
          operations
        </p>
      </div>
      <q-chip
        :color="statusColor"
        text-color="white"
        square
        class="status-chip"
        data-testid="run-status"
        >{{ state.status }}</q-chip
      >
    </div>
    <q-banner v-if="state.error" class="error-banner" role="alert" rounded>{{
      state.error
    }}</q-banner>
    <q-banner class="mobile-replay-note" rounded
      >Phone view is read-only replay mode. Scenario authoring and runtime switching are available
      on tablet or desktop.</q-banner
    >
    <div class="control-grid authoring-controls">
      <q-select
        v-model="state.selectedScenarioId"
        :options="scenarioOptions"
        emit-value
        map-options
        outlined
        dark
        label="Failure scenario"
        :disable="state.status === 'running'"
      />
      <q-input
        v-model="state.seed"
        outlined
        dark
        label="Visible replay seed"
        maxlength="120"
        :disable="state.status === 'running'"
      />
      <q-btn-toggle
        v-model="state.mode"
        spread
        no-caps
        toggle-color="primary"
        color="grey-9"
        :options="[
          { label: 'Fixture', value: 'fixture' },
          { label: 'Local API', value: 'local' },
        ]"
        aria-label="Runtime mode"
        :disable="state.status === 'running'"
      />
    </div>
    <div class="action-row">
      <q-btn
        color="primary"
        unelevated
        no-caps
        size="lg"
        label="Run baseline"
        aria-label="Run baseline experiment"
        data-testid="run-baseline"
        :loading="state.status === 'running'"
        :disable="state.status === 'running'"
        @click="store.run"
      />
      <q-btn
        outline
        color="grey-4"
        no-caps
        size="lg"
        label="Reset"
        aria-label="Reset experiment"
        data-testid="reset-experiment"
        @click="store.reset"
      />
      <span class="mode-label mono">{{
        state.mode === 'fixture'
          ? 'Synthetic fixture · no network'
          : 'Local Hono · explicit localhost'
      }}</span>
    </div>
    <p class="benchmark-note">
      Simulated time and synthetic data — not a real-world API SLA benchmark.
    </p>
  </section>
</template>

<style scoped lang="scss">
.controls {
  padding: var(--space-6);
}
.scenario-banner,
.action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}
.scenario-meta,
.benchmark-note,
.mode-label {
  color: var(--color-muted);
  font-size: 0.78rem;
}
.control-grid {
  display: grid;
  grid-template-columns: minmax(13rem, 1.4fr) minmax(11rem, 1fr) minmax(13rem, 1fr);
  gap: var(--space-4);
  margin-top: var(--space-5);
}
.action-row {
  justify-content: flex-start;
  margin-top: var(--space-5);
}
.action-row :deep(.q-btn) {
  min-height: 48px;
}
.mode-label {
  margin-left: auto;
}
.error-banner {
  margin-top: var(--space-4);
  border: 1px solid color-mix(in srgb, var(--color-danger) 45%, transparent);
  background: color-mix(in srgb, var(--color-danger) 13%, var(--color-surface));
}
@media (max-width: 900px) {
  .control-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 639px) {
  .controls {
    padding: var(--space-4);
  }
  .scenario-banner,
  .action-row {
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .mode-label {
    width: 100%;
    margin-left: 0;
  }
}
</style>
