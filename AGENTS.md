# AGENTS.md — Codex execution contract

## Mission and scope

Build **Frontend Resilience Patterns**, portfolio project 02/17, as a Quasar/Vue 3/TypeScript SPA + optional Hono chaos API, preserving the source blueprint. THIS DIRECTORY IS A HANDOFF, NOT YET A BUILT APPLICATION. Scaffold code into the root according to `10-repository-map.md`, without deleting the source documents, `brand/`, `specs/`, or new implementation guidance.

## Mandatory first read (in order)

1. `CODEX-START.md`
2. `01-blueprint.md`; `02-phases.md`
3. `10-repository-map.md`; `11-engineering-policies.md`; `04-dependencies-and-services.md`
4. `03-design-tokens.md`; `05-brand-system.md`
5. `docs/adr/0001-implementation-clarifications.md`
6. `docs/implementation/00-guide.md` then pertinent `docs/implementation/*.md`
7. Active `phases/NN-...md`; `agent/TASK-BRIEF.md`; `agent/CONSTRAINTS.md`

## Source hierarchy

- Original project 01–11, phase files, brand, and global standards define product intent, authoritative stack, release order, and color/brand identity.
- `docs/adr/0001-implementation-clarifications.md` resolves **internal source inconsistencies** for this specific implementation; changes require a new ADR.
- `docs/implementation/` and `specs/` fill **previously unspecified implementation details**; change via recorded ADR or test-backed explicit update, never silently.
- A new user instruction overrides suggestions but not security, honesty about results, or source-derived constraints.

## Execution protocol

1. Work on **only the active phase**; first phase is `v0.1.0`. Later phases wait until current acceptance and verification are complete.
2. Before coding, inspect working tree and tools, identify absent prerequisites, then state a concrete task plan and expected touched paths.
3. Scaffold in-place or in a temporary directory and migrate accurately. Do not create an unrelated Vue/Vite project; use **Quasar CLI `@quasar/app-vite` v3**.
4. Resolve and pin exact compatible dependency versions at kickoff, generate `pnpm-lock.yaml`, document versions in `docs/toolchain.lock.md`; don't invent version numbers.
5. Build smallest functioning **vertical slice**: seeded failure runner, baseline path, telemetry, clear UI feedback, reset, tests, local Hono compatibility. A catalog/control panel may show clearly marked later-phase previews only, never fabricated working patterns.
6. Time/PRNG/transport are injected; comparisons are reproducible; no retries/hedges on unsafe mutations without proven idempotency; no hidden network requests in fixture demo.
7. Keep pure policies independent of Quasar, Vue, Pinia, Hono, fetch, DOM, and timers. Cross-package dependencies through public exports only. Enforce boundaries in CI.
8. Use provided brand and semantic SCSS tokens. Desktop-first console, tablet stacked panels, mobile read-only replay. Accessibility, reduced motion, failure and degraded state labels are not optional.
9. Do not add or substitute paid APIs, proprietary code/assets, unnecessary framework libraries, unnecessary Docker, or Cloudflare dependency. Do not redraw logos.
10. Implement documented npm scripts (`dev`, `dev:all`, `seed`, `reset`, `codegen`, `lint`, `architecture:check`, `typecheck`, `test`, `test:e2e`, `build`, `build:demo`, `verify`) with **real actions**. No fake `echo OK` checks. `codegen` can validate that no generation is needed, but document that decision.
11. Each behavior change includes unit/integration/E2E coverage and documentation. Prefer fake-clock deterministic tests. Run actual commands, report failures honestly.
12. Before phase close, run `pnpm verify`, update `agent/HANDOFF.md`, complete `agent/ACCEPTANCE-CHECKLIST.md`, add ADR if required, describe known limitations and next safe step. Tag/release only when verified and when repository permissions allow it; otherwise provide tag instructions.

## Clarifications, not optional rewrites

- App directory is `apps/lab` (the `apps/web` example in original repository map is generic).
- Circuit-breaker *UI preview* can exist in phase 1; **actual circuit-breaker behavior** begins phase 3. Bulkhead UI can be planned before phase 4, but not falsely marked functional.
- Public GitHub Pages is fixture-only. Use Quasar's build configuration for base URL; use hash routing for static deployment unless an ADR documents an equally robust fallback.
- The source's sample workflow YAML, Dockerfile, and `.env.example` are **templates**, not validated deployable production artifacts. Replace/complete them during applicable phase; never claim they're ready unchanged.

## Deliverable reporting format

At end of each Codex response: implemented behaviors; changed files; install/build/test commands and real results; deviations/ADRs; unresolved limitations; next phase gating. If blocked, leave an explicit failing check rather than silently skipping it.
