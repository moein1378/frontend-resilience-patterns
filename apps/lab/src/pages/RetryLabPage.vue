<script setup lang="ts">
import { onUnmounted } from 'vue';
import { builtInScenarios } from '@frp/failure-scenarios';
import { createRetryComparisonStore } from '@/modules/experiment/retry-comparison.store.js';

const store = createRetryComparisonStore();
const state = store.state;
const scenarioOptions = builtInScenarios.map(({ id, title }) => ({ label: title, value: id }));
const ratio = (numerator: number, denominator: number) =>
  denominator === 0
    ? 'N/A (0 samples)'
    : `${Math.round((numerator / denominator) * 100)}% (${numerator}/${denominator})`;

function exportTrace() {
  const blob = new Blob(
    [
      JSON.stringify(
        {
          schemaVersion: 1,
          input: state.completedInput,
          results: state.results,
        },
        null,
        2,
      ),
    ],
    { type: 'application/json' },
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'retry-comparison.json';
  link.click();
  URL.revokeObjectURL(url);
}
onUnmounted(store.reset);
</script>

<template>
  <q-page class="page-shell">
    <header>
      <p class="eyebrow">Phase 02 · shared deadlines and bounded retries</p>
      <h1 class="page-title">Retry and Jitter Lab</h1>
      <p class="lede">
        Replay the same seeded workload through a single attempt, synchronized exponential retries,
        and full jitter. Retry cost and user-visible success belong together.
      </p>
    </header>
    <section class="surface lab-controls section-gap" aria-label="Retry comparison controls">
      <q-banner class="mobile-replay-note"
        >Phone view is read-only replay mode. Replay the default comparison below.</q-banner
      >
      <q-banner v-if="state.error" role="alert">{{ state.error }}</q-banner>
      <div class="authoring-controls control-grid">
        <q-select
          v-model="state.selectedScenarioId"
          outlined
          dark
          label="Comparison scenario"
          :options="scenarioOptions"
          emit-value
          map-options
          :disable="state.status === 'running'"
        />
        <q-input
          v-model="state.seed"
          outlined
          dark
          label="Comparison seed"
          maxlength="120"
          :disable="state.status === 'running'"
        />
        <q-select
          v-model="state.mode"
          outlined
          dark
          label="Comparison runtime"
          :options="[
            { label: 'Fixture', value: 'fixture' },
            { label: 'Local API', value: 'local' },
          ]"
          emit-value
          map-options
          :disable="state.status === 'running'"
        />
        <q-input
          v-model.number="state.policy.budgetMs"
          type="number"
          min="100"
          max="10000"
          outlined
          dark
          label="Shared budget (100–10000 ms)"
          :disable="state.status === 'running'"
        />
        <q-input
          v-model.number="state.policy.maxAttempts"
          type="number"
          min="1"
          max="5"
          outlined
          dark
          label="Maximum attempts (1–5)"
          :disable="state.status === 'running'"
        />
        <q-input
          v-model.number="state.policy.baseDelayMs"
          type="number"
          min="0"
          max="2000"
          outlined
          dark
          label="Base backoff (0–2000 ms)"
          :disable="state.status === 'running'"
        />
        <q-input
          v-model.number="state.policy.capMs"
          type="number"
          :min="state.policy.baseDelayMs"
          max="10000"
          outlined
          dark
          label="Backoff cap (base–10000 ms)"
          :disable="state.status === 'running'"
        />
      </div>
      <div class="actions">
        <q-btn
          label="Run comparison"
          color="primary"
          no-caps
          :disable="state.status === 'running'"
          @click="store.run"
        />
        <q-btn
          label="Cancel comparison"
          outline
          no-caps
          :disable="state.status !== 'running'"
          @click="store.cancel"
        />
        <q-btn label="Reset comparison" outline no-caps @click="store.reset" />
        <q-btn
          label="Export comparison JSON"
          outline
          no-caps
          :disable="state.results.length === 0"
          @click="exportTrace"
        />
        <span role="status" data-testid="comparison-status">{{ state.status }}</span>
      </div>
      <p class="note">
        One deadline includes every attempt and backoff. Only safe reads retry; mutation retries
        require implemented deduplication and remain disabled. Simulated faults paced by the browser
        clock; this is not an API benchmark.
      </p>
    </section>

    <section
      v-if="state.results.length"
      class="comparison-grid section-gap"
      aria-label="Same-seed comparison results"
    >
      <article
        v-for="(result, index) in state.results"
        :key="result.label"
        class="surface result"
        :data-testid="`comparison-result-${index}`"
      >
        <h2 class="panel-title">{{ result.label }}</h2>
        <p class="note">
          {{ state.completedInput?.scenarioId }} · {{ state.completedInput?.seed }} ·
          {{ state.completedInput?.policy.budgetMs }} ms budget
        </p>
        <dl>
          <dt>Logical success</dt>
          <dd>
            {{
              ratio(
                result.metrics.logicalSuccessRate.numerator,
                result.metrics.logicalSuccessRate.denominator,
              )
            }}
          </dd>
          <dt>Upstream attempts</dt>
          <dd>{{ result.metrics.upstreamAttempts }}</dd>
          <dt>Attempt error rate</dt>
          <dd>
            {{
              ratio(
                result.metrics.upstreamErrorRate.numerator,
                result.metrics.upstreamErrorRate.denominator,
              )
            }}
          </dd>
          <dt>Logical p95</dt>
          <dd>
            {{
              result.metrics.p95LatencyMs === null
                ? 'N/A'
                : `${Math.round(result.metrics.p95LatencyMs)} ms`
            }}
          </dd>
          <dt>Retry amplification</dt>
          <dd>{{ result.metrics.retryAmplification?.toFixed(2) ?? 'N/A' }}×</dd>
          <dt>Aborted attempts</dt>
          <dd>{{ result.metrics.upstreamAborted }}</dd>
        </dl>
        <p class="note">
          Logical latency includes attempts and backoffs; deliberately cancelled operations are
          excluded.
        </p>
        <p v-if="result.truncatedEvents" role="alert">
          Trace truncated: {{ result.truncatedEvents }} events omitted.
        </p>
        <details>
          <summary>Attempt trace · {{ result.events.length }} events</summary>
          <div class="table-wrap">
            <table>
              <caption>
                {{
                  result.label
                }}
                trace · relative time in ms
              </caption>
              <thead>
                <tr>
                  <th scope="col">Time</th>
                  <th scope="col">Operation</th>
                  <th scope="col">Attempt</th>
                  <th scope="col">Event / outcome</th>
                  <th scope="col">Delay (ms) / source</th>
                  <th scope="col">Remaining budget (ms)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="event in result.events" :key="event.sequence">
                  <td>{{ Math.round(event.atMs) }}</td>
                  <td>{{ event.operationId }}</td>
                  <td>{{ event.attemptIndex === undefined ? '—' : event.attemptIndex + 1 }}</td>
                  <td>{{ event.kind }} {{ event.outcome ?? '' }}</td>
                  <td>
                    {{ event.details?.delayMs ?? '—' }} {{ event.details?.delaySource ?? '' }}
                  </td>
                  <td>{{ event.details?.remainingMs ?? '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </details>
      </article>
    </section>
    <section class="surface explanation section-gap" aria-labelledby="storm-heading">
      <h2 id="storm-heading" class="panel-title">Why synchronized retries can create a storm</h2>
      <p>
        Repeated failures place retries on the same exponential schedule. Full jitter spreads each
        delay across that schedule's cap. Inspect retry-scheduled and attempt-started rows to see
        the distribution for this seed.
      </p>
      <p>
        Retries add upstream work and may increase latency. Jitter does not guarantee better
        success. For a burst illustration select Synchronized retry storm; Retry-After can align
        requests even when jitter is enabled.
      </p>
    </section>
  </q-page>
</template>

<style scoped lang="scss">
.lab-controls,
.result,
.explanation {
  padding: var(--space-6);
}
.control-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-4);
}
.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-5);
}
.actions :deep(.q-btn) {
  min-height: 44px;
}
.note {
  color: var(--color-muted);
  font-size: 0.8rem;
}
.comparison-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-4);
}
.result {
  min-width: 0;
}
.result h2 {
  font-size: 1.15rem;
}
dl {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--space-3);
  font-size: 0.9rem;
}
dd {
  margin: 0;
  font-family: var(--font-mono);
}
summary {
  cursor: pointer;
  min-height: 44px;
  padding-block: var(--space-3);
}
.table-wrap {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
}
th,
td {
  white-space: nowrap;
  text-align: left;
  padding: var(--space-2);
  border-bottom: 1px solid var(--color-border);
}
@media (max-width: 1000px) {
  .comparison-grid {
    grid-template-columns: 1fr;
  }
  .control-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 639px) {
  .lab-controls,
  .result,
  .explanation {
    padding: var(--space-4);
  }
}
</style>
