# Source provenance, assumptions and decisions not yet made

## Directly sourced from original v3 ZIP

- Project number 02/17, exact project name/category, repo slug.
- Quasar CLI with Vite SPA + Vue3 + TS + SCSS semantic tokens, local Hono chaos fixture.
- No SSR; GitHub Pages static fixture; optional Worker; Docker optional, not decorative.
- Seven main pattern topics plus optional hedged GET; nine route templates, six named UI surfaces.
- Deterministic same-seed workload/failure schedules; unsafe mutation safety; metrics and timeline.
- Seven ordered releases v0.1.0→v1.0.0; `pnpm verify` phase gate.
- Exact design-token palette/fonts and already-generated brand/favicons.
- Node 24 LTS, `pnpm` lockfile discipline, Quasar 2.x / app-vite 3.x baseline, Vitest/Playwright/fast-check/Zod.

## Added as *implementation proposals* in this handoff

- Canonical seven route slugs, endpoint shape `/v1/execute`, event schema candidates and field names.
- Fault hashing algorithm (FNV-1a/Mulberry32), operation+attempt keyed randomness and golden test scheme.
- Numerical policy defaults: timeout 1500ms; retries 3; breaker window/threshold; bulkhead 3+5; rate limiter 5+2/s; fallback TTL 5/60s.
- Hash router for Pages; Node Hono health endpoint `/healthz`; server port `3001`.
- Suggested caps and event buffer max sizes; exact p95 nearest rank definition.
- Proposed package dependency graph, adapters and progression details where generic source leaves options.

Proposals should be validated/accepted or superseded by a documented ADR at kickoff, not mistaken for original source facts.

## Questions that may be decided during implementation

1. Exact Quasar/Vue/pnpm/Node 24 patch versions at kickoff (resolve from installed tools/official compatible scaffold).
2. Exact chart library (source mentions metrics/timeline but does not mandate ECharts); prefer light SVG/CSS unless evidence justifies a dependency.
3. Whether Pinia is necessary for UI state (not required by source stack); default to composables/local view-model until a state-sharing need emerges.
4. Storage engine for results (bounded localStorage vs IndexedDB), introduced with `/results` when needed.
5. Which optional advanced hedged GET demo, if any, can be added without misleading mutation semantics.
6. Cloudflare Worker publication/account ownership; never required for project's successful completion.
7. GitHub account/repo URL, chosen license, final screenshots and actual production deployment values. Do not invent them.

## Known source template limitations

- `phases` files include generic repetitive 'activated modules' and sparse file lists. Use specific release objective and explicit domain invariants instead.
- The original `.env.example`, Actions workflow and Dockerfile are templates, not immediately runnable products.
- The source includes no implemented app, real benchmark measurements, committed lockfile or verified passing test suite. This handoff must not be described as already passing CI.
