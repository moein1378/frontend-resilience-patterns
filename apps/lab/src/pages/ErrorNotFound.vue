<template>
  <q-page class="page-shell not-found">
    <p class="eyebrow">Route unavailable</p>
    <h1 class="page-title">404 · No experiment lives here.</h1>
    <p class="lede">Return to the deterministic baseline or open the pattern catalog.</p>
    <q-btn to="/" color="primary" unelevated no-caps size="lg" label="Return to overview" />
  </q-page>
</template>

<style scoped>
.not-found {
  display: grid;
  min-height: 60vh;
  align-content: center;
  justify-items: start;
  gap: var(--space-4);
}
</style>
