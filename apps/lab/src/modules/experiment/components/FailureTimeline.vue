<script setup lang="ts">
import { computed } from 'vue';
import { useExperimentStore } from '../experiment.store.js';
const state = useExperimentStore().state;
const rows = computed(() => state.events.filter(({ kind }) => kind !== 'run-started'));
</script>

<template>
  <section class="timeline surface" aria-labelledby="timeline-heading">
    <div class="timeline-heading">
      <div>
        <p class="eyebrow">Accessible raw evidence</p>
        <h2 id="timeline-heading" class="panel-title">Failure timeline</h2>
      </div>
      <span class="mono">{{ rows.length }} events</span>
    </div>
    <div v-if="rows.length === 0" class="empty-state" data-testid="timeline-empty">
      Run the baseline to populate deterministic logical and physical attempt events.
    </div>
    <div v-else class="table-wrap" data-testid="failure-timeline">
      <table>
        <caption>
          Baseline trace ordered by relative simulated time and sequence
        </caption>
        <thead>
          <tr>
            <th scope="col">Time</th>
            <th scope="col">Event</th>
            <th scope="col">Operation</th>
            <th scope="col">Outcome</th>
            <th scope="col">HTTP</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in rows" :key="event.sequence">
            <td class="mono">{{ Math.round(event.atMs) }} ms</td>
            <td>{{ event.kind }}</td>
            <td class="mono">{{ event.operationId }}</td>
            <td>
              <span :class="['outcome', event.outcome ? `outcome--${event.outcome}` : '']">{{
                event.outcome ?? '—'
              }}</span>
            </td>
            <td class="mono">{{ event.statusCode ?? '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped lang="scss">
.timeline {
  overflow: hidden;
}
.timeline-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--color-border);
}
.timeline-heading > span,
.empty-state {
  color: var(--color-muted);
}
.empty-state {
  padding: var(--space-8) var(--space-6);
  text-align: center;
}
.table-wrap {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}
caption {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
th,
td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  text-align: left;
  white-space: nowrap;
}
th {
  color: var(--color-muted);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.outcome::before {
  content: '○';
  margin-right: var(--space-2);
}
.outcome--success::before {
  color: var(--color-success);
  content: '●';
}
.outcome--http-5xx::before,
.outcome--network-error::before,
.outcome--invalid-payload::before {
  color: var(--color-danger);
  content: '×';
}
</style>
