<div align="center">
  <img src="./brand/logo-filled.svg" alt="Frontend Resilience Patterns logo" width="88" />
  <h1>Frontend Resilience Patterns</h1>
  <p><strong>Codex implementation handoff · Portfolio project 02 / 17</strong></p>
</div>

**A visual lab for client-side failures, recovery policies, and their trade-offs.** Reproduce the same seeded workload against unprotected and protected request paths. Inspect attempts, user-visible outcomes, state changes, and timeline evidence.

**STATUS: specification / handoff, not yet an implemented or verified app.** Do not claim a passing build or a working public demo until Codex implements and tests it.

- [Start Codex with this prompt](CODEX-START.md) · [Continue subsequent phases](CODEX-CONTINUE.md) · [راهنمای فارسی](README-HANDOFF-FA.md) · [گزارش تحلیل](AUDIT-REPORT-FA.md)
- [Original product blueprint](01-blueprint.md) · [Original release phases](02-phases.md) · [Implementation guidance](docs/implementation/00-guide.md)
- [Architecture](10-repository-map.md) · [Executable contract proposals](docs/implementation/03-domain-and-algorithms.md) · [Acceptance matrix](docs/implementation/08-acceptance-and-test-matrix.md)
- [Design tokens](03-design-tokens.md) · [Original brand assets](brand/) · [Environment/setup](PREREQUISITES.md)

**Authoritative stack (source):** Quasar CLI + Vite SPA, Vue 3, TypeScript, SCSS semantic tokens; a local Hono chaos API. Demo mode is static and deterministic, deployed to GitHub Pages. No paid services, employer data, or live hosted backend are required.

**Important:** The original source documents are preserved. Implementation-level clarifications are called out in [ADR-0001](docs/adr/0001-implementation-clarifications.md); implementation must be done one tagged phase at a time.
