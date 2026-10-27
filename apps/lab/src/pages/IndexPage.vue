<script setup lang="ts">
import ExperimentWorkspace from '@/modules/experiment/components/ExperimentWorkspace.vue';
</script>
<template>
  <q-page class="page-shell">
    <header class="hero">
      <div>
        <p class="eyebrow">Portfolio project 02 / 17 · Chaos Harness</p>
        <h1 class="hero-title">Failures you can replay. Evidence you can inspect.</h1>
        <p class="lede">
          A deterministic frontend lab for seeing how client behavior changes under latency,
          malformed payloads, connection drops, and service errors—before any protection policy is
          added.
        </p>
      </div>
      <aside class="thesis-card surface" aria-label="Phase 01 scope">
        <span class="mono">v0.1.0</span><strong>Baseline, not a benchmark</strong>
        <p>Every result below is synthetic, seed-controlled, and derived from a raw trace.</p>
        <router-link to="/patterns/circuit-breaker/unprotected"
          >View Circuit Breaker preview →</router-link
        >
      </aside>
    </header>
    <ExperimentWorkspace class="section-gap" />
  </q-page>
</template>
<style scoped lang="scss">
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(17rem, 0.35fr);
  align-items: end;
  gap: var(--space-8);
}
.thesis-card {
  display: grid;
  gap: var(--space-3);
  padding: var(--space-6);
}
.thesis-card > span,
.thesis-card a {
  color: var(--color-brand);
}
.thesis-card p {
  margin: 0;
  color: var(--color-muted);
}
@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
  }
}
</style>
