<script setup lang="ts">
import ExperimentWorkspace from '@/modules/experiment/components/ExperimentWorkspace.vue';
</script>
<template>
  <q-page class="page-shell"
    ><header>
      <p class="eyebrow">Circuit Breaker Console · Phase 03 preview</p>
      <h1 class="page-title">Observe the baseline before the breaker exists.</h1>
      <p class="lede">
        This route runs the real Phase 01 unprotected client. Breaker state, thresholds, cooldown,
        and probe controls are intentionally absent.
      </p>
    </header>
    <q-banner class="preview-warning surface section-gap" rounded
      ><strong>Preview only:</strong> no closed, open, or half-open state is simulated or claimed in
      v0.1.0.</q-banner
    ><ExperimentWorkspace class="section-gap"
  /></q-page>
</template>
<style scoped>
.preview-warning {
  border-color: color-mix(in srgb, var(--color-warning) 45%, transparent);
  background: color-mix(in srgb, var(--color-warning) 10%, var(--color-surface));
}
</style>
