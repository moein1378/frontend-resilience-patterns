<script setup lang="ts">
import ScenarioControls from './ScenarioControls.vue';
import MetricsSummary from './MetricsSummary.vue';
import FailureTimeline from './FailureTimeline.vue';
</script>
<template>
  <div>
    <ScenarioControls /><MetricsSummary class="section-gap" /><FailureTimeline
      class="section-gap"
    />
  </div>
</template>
