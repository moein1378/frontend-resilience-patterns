<script setup lang="ts">
import { computed } from 'vue';
import { useExperimentStore } from '../experiment.store.js';
const state = useExperimentStore().state;
const success = computed(() => state.metrics?.logicalSuccessRate);
const percent = computed(() =>
  success.value?.ratio == null ? 'N/A' : `${Math.round(success.value.ratio * 100)}%`,
);
const p95 = computed(() =>
  state.metrics?.p95LatencyMs == null ? 'N/A' : `${Math.round(state.metrics.p95LatencyMs)} ms`,
);
const amplification = computed(() =>
  state.metrics?.retryAmplification == null
    ? 'N/A'
    : `${state.metrics.retryAmplification.toFixed(1)}×`,
);
</script>

<template>
  <section aria-labelledby="metrics-heading">
    <div class="section-heading">
      <div>
        <p class="eyebrow">Measured experiment output</p>
        <h2 id="metrics-heading" class="panel-title">Baseline telemetry</h2>
      </div>
      <span class="mono metric-source">derived from raw trace events</span>
    </div>
    <div class="metric-grid" data-testid="metrics-summary">
      <article class="metric surface">
        <span>Logical success</span><strong>{{ percent }}</strong
        ><small>{{ success?.numerator ?? 0 }} / {{ success?.denominator ?? 0 }} completed</small>
      </article>
      <article class="metric surface">
        <span>p95 logical latency</span><strong>{{ p95 }}</strong
        ><small>nearest-rank · cancels excluded</small>
      </article>
      <article class="metric surface">
        <span>Upstream attempts</span><strong>{{ state.metrics?.upstreamAttempts ?? 'N/A' }}</strong
        ><small>physical execute invocations</small>
      </article>
      <article class="metric surface">
        <span>Attempt amplification</span><strong>{{ amplification }}</strong
        ><small>attempts / logical starts</small>
      </article>
    </div>
  </section>
</template>

<style scoped lang="scss">
.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}
.metric-source,
.metric small,
.metric span {
  color: var(--color-muted);
  font-size: 0.78rem;
}
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
}
.metric {
  display: grid;
  gap: var(--space-2);
  padding: var(--space-5);
}
.metric strong {
  color: var(--color-text);
  font-family: var(--font-display);
  font-size: 1.8rem;
}
@media (max-width: 1023px) {
  .metric-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 639px) {
  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }
  .metric-grid {
    grid-template-columns: 1fr;
  }
}
</style>
