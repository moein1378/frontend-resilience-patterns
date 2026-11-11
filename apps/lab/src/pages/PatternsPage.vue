<script setup lang="ts">
const patterns = [
  {
    name: 'Timeout budget',
    phase: 'Phase 02',
    risk: 'A deadline is shared across attempts and waits.',
  },
  {
    name: 'Retry + full jitter',
    phase: 'Phase 02',
    risk: 'Unsafe mutations stay ineligible without deduplication.',
  },
  {
    name: 'Circuit breaker',
    phase: 'Phase 03',
    risk: 'Premature opening can reduce user success.',
  },
  { name: 'Bulkhead', phase: 'Phase 04', risk: 'Queues consume the same user-visible budget.' },
  {
    name: 'Token-bucket limiter',
    phase: 'Phase 04',
    risk: 'Load control does not repair upstream failures.',
  },
  {
    name: 'Load shedding',
    phase: 'Phase 04',
    risk: 'Rejection must remain explicit, never synthetic success.',
  },
  {
    name: 'Stale fallback',
    phase: 'Phase 05',
    risk: 'Stale reads need age, source, and read-only labels.',
  },
];
</script>
<template>
  <q-page class="page-shell">
    <header>
      <p class="eyebrow">Decision catalog · progressive implementation</p>
      <h1 class="page-title">Resilience patterns, with costs attached.</h1>
      <p class="lede">
        The failure harness now supports shared deadlines and bounded retries with jitter. Later
        protections remain visibly gated until their own phase.
      </p>
    </header>
    <section class="pattern-grid section-gap" aria-label="Pattern catalog">
      <article v-for="pattern in patterns" :key="pattern.name" class="pattern-card surface">
        <q-badge outline color="orange">{{ pattern.phase }}</q-badge>
        <h2>{{ pattern.name }}</h2>
        <p>{{ pattern.risk }}</p>
        <q-btn
          v-if="pattern.phase === 'Phase 02'"
          to="/retry-lab"
          outline
          color="primary"
          no-caps
          label="Open Retry Lab"
        />
        <span v-else class="mono">Preview only · not implemented</span>
      </article>
    </section>
    <section class="breaker-preview surface section-gap" aria-labelledby="breaker-preview-heading">
      <div>
        <p class="eyebrow">Circuit Breaker Console</p>
        <h2 id="breaker-preview-heading" class="panel-title">Phase 03 preview</h2>
        <p>
          No breaker state, rolling window, cooldown, or half-open probe is active in this phase.
        </p>
      </div>
      <q-btn
        to="/patterns/circuit-breaker/unprotected"
        outline
        color="primary"
        no-caps
        label="Inspect real baseline"
      />
    </section>
  </q-page>
</template>
<style scoped lang="scss">
.pattern-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-4);
}
.pattern-card {
  padding: var(--space-5);
}
.pattern-card h2 {
  font-family: var(--font-display);
  font-size: 1.15rem;
}
.pattern-card p,
.pattern-card > span,
.breaker-preview p {
  color: var(--color-muted);
}
.pattern-card > span {
  font-size: 0.72rem;
}
.breaker-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
  padding: var(--space-6);
}
@media (max-width: 900px) {
  .pattern-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 639px) {
  .pattern-grid {
    grid-template-columns: 1fr;
  }
  .breaker-preview {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
