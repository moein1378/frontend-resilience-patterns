<script setup lang="ts">
import ExperimentWorkspace from '@/modules/experiment/components/ExperimentWorkspace.vue';
</script>
<template>
  <q-page class="page-shell"
    ><header>
      <p class="eyebrow">Seeded scenario runner</p>
      <h1 class="page-title">Failure Simulator</h1>
      <p class="lede">
        Select a bounded synthetic fault, run one unprotected attempt per operation, and inspect the
        normalized evidence.
      </p>
    </header>
    <ExperimentWorkspace class="section-gap"
  /></q-page>
</template>
