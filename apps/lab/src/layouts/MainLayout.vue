<template>
  <q-layout view="hHh lpR fFf" class="app-layout">
    <q-header class="app-header">
      <q-toolbar class="toolbar">
        <router-link to="/" class="brand-link" aria-label="Frontend Resilience Patterns home">
          <img src="/logo-solid.svg" width="36" height="36" alt="" />
          <span>Frontend Resilience Patterns</span>
        </router-link>
        <q-space />
        <q-badge outline color="orange" class="phase-badge">Phase 01 · Fixture</q-badge>
      </q-toolbar>
      <nav aria-label="Primary navigation" class="nav-row">
        <q-tabs dense align="left" active-color="orange" indicator-color="orange" no-caps>
          <q-route-tab to="/" exact label="Overview" />
          <q-route-tab to="/simulator" label="Simulator" />
          <q-route-tab to="/patterns" label="Patterns" />
        </q-tabs>
      </nav>
    </q-header>
    <q-page-container><router-view /></q-page-container>
  </q-layout>
</template>

<style scoped lang="scss">
.app-layout {
  min-height: 100vh;
  background: transparent;
}
.app-header {
  border-bottom: 1px solid var(--color-border);
  background: rgb(3 7 18 / 0.92);
  backdrop-filter: blur(14px);
}
.toolbar,
.nav-row {
  width: min(calc(100% - 2rem), var(--content-wide));
  margin: 0 auto;
}
.brand-link {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  gap: var(--space-3);
  color: var(--color-text);
  font-family: var(--font-display);
  font-weight: 700;
  text-decoration: none;
}
.phase-badge {
  min-height: 28px;
  padding-inline: var(--space-3);
}
@media (max-width: 639px) {
  .toolbar,
  .nav-row {
    width: min(calc(100% - 1rem), var(--content-wide));
  }
  .brand-link span {
    max-width: 12rem;
    font-size: 0.88rem;
    line-height: 1.2;
  }
  .phase-badge {
    display: none;
  }
}
</style>
