# Agent acceptance checklist — PHASE 01 (unverified until Codex runs tests)

- [ ] Official Quasar CLI/Vite Vue 3 TypeScript SPA scaffold, pinned workspace and lockfile.
- [ ] Browser fixture requires zero API/provider access; explicit fixture status visible.
- [ ] Shared deterministic versioned scenario schema, seeds and logical workloads.
- [ ] Local Node Hono API uses same fault evaluator and validates/bounds inputs.
- [ ] Baseline seeded 503, latency, malformed and disconnect scenarios visible.
- [ ] Timeline distinguishes physical attempts from logical outcomes, with p95 semantics.
- [ ] Reset aborts outstanding operations/timers; stale results cannot reappear.
- [ ] Circuit breaker UI preview explicitly not implemented until Phase 03.
- [ ] Source logo/favicons integrated without re-drawing; semantic tokens consumed.
- [ ] Keyboard/focus/reduced motion + mobile read-only replay state tested.
- [ ] Dependency boundaries enforced by a failing negative case.
- [ ] Unit, contract, integration and baseline Playwright E2E actually pass.
- [ ] No secrets, paid accounts, employer code, fake API-success states.
- [ ] `pnpm verify` really passes; docs/readme/setup/changelog updated.
- [ ] Commands, real results, changed files, limitations recorded in `agent/HANDOFF.md`.
- [ ] `v0.1.0` release/tag prepared **only after** verification.
