# Phase 01 Chaos Harness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the verified `v0.1.0` deterministic baseline chaos lab with an offline Quasar fixture, a parity-tested local Hono adapter, truthful telemetry, reset safety, and a reviewer-visible browser workflow.

**Architecture:** A pnpm workspace composes four narrow packages into two applications. `@frp/contracts` owns Zod schemas and shared types; scenario evaluation and telemetry remain pure; `@frp/resilience-core` exposes only Phase 01 ports and baseline orchestration. The Quasar app owns UI state and adapters, while Hono translates HTTP without duplicating fault logic.

**Tech Stack:** Node 24 LTS, pnpm, Quasar CLI/Vite SPA, Vue 3, strict TypeScript, SCSS, Zod, Hono, Vitest, Playwright, ESLint.

**Spec:** `CODEX-START.md`, `phases/01-v0.1.0-chaos-harness-and-failure-model.md`, and `docs/implementation/00-guide.md` through `08-acceptance-and-test-matrix.md`.

## Global Constraints

- Implement Phase 01 only: no timeout/retry/breaker/bulkhead/rate-limit/fallback policy behavior.
- Fixture mode performs no network request and remains the default/static-demo mode.
- Same normalized scenario, seed, logical operation, attempt, and endpoint must produce the same semantic fault in browser and Hono.
- Time, randomness, and transport are injected; reset aborts pending work and blocks stale commits.
- Cross-package imports use public exports and follow the documented acyclic dependency graph.
- Use the supplied brand assets and semantic tokens; phone mode is read-only replay and all state has textual labels.
- Tests assert normalized logical results, not wall-clock timing or framework implementation details.

## Review Focus

- Unsupported scenario versions and oversized/out-of-range attempt payloads are rejected at the Zod/HTTP boundary.
- A nominal HTTP 200 with malformed synthetic data becomes `invalid-payload`, never success.
- Reset during an abortable delay prevents the old run from repopulating visible results.
- Fixture mode never silently probes `localhost` when the Hono service is absent.
- Replaying the same scenario and seed produces the same normalized fault classes and relative trace ordering.

---

### Task 1: Workspace, official Quasar scaffold, and executable boundaries

**Files:**
- Create/modify: `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `.nvmrc`, `tsconfig.base.json`, `eslint.config.mjs`
- Create/modify: `apps/lab/**`, `apps/chaos-api/package.json`, `packages/*/package.json`, `packages/*/tsconfig.json`
- Create/test: `scripts/check-architecture.mjs`, `scripts/check-architecture.test.ts`

**Interfaces:**
- Produces workspace package names `@frp/contracts`, `@frp/failure-scenarios`, `@frp/resilience-core`, and `@frp/telemetry` with explicit public exports.
- Produces real root commands for lint, architecture, typecheck, unit/integration/E2E, build, demo build, seed, reset, codegen, and verify.

- [ ] Scaffold the official Quasar CLI/Vite TypeScript/SCSS SPA into `apps/lab`, preserving the handoff root.
- [ ] Write an architecture-check test with allowed imports plus a forbidden package-to-app/framework import; run it and observe the forbidden case is not yet rejected.
- [ ] Implement the import-boundary checker and explicit workspace package exports; rerun the focused test to green.
- [ ] Add strict shared TypeScript and ESLint configuration and verify empty package entry points typecheck.

### Task 2: Versioned contracts and deterministic scenario engine

**Files:**
- Create/test: `packages/contracts/src/*.ts`, `packages/contracts/src/*.test.ts`
- Create/test: `packages/failure-scenarios/src/*.ts`, `packages/failure-scenarios/src/*.test.ts`
- Validate: `specs/scenarios.json`, `specs/workloads.json`, `specs/metrics-test-vectors.json`

**Interfaces:**
- Produces Zod-backed `Scenario`, `Workload`, `AttemptRequest`, `AttemptResponse`, `LogicalOutcome`, `TraceEvent`, and stable problem schemas.
- Produces `hash32(value: string): number`, seeded random helpers, `buildWorkloadPlan(...)`, and `faultFor(input): FaultDecision`.

- [ ] Write schema tests for valid specs, unknown versions, duplicate IDs, bounded IDs, probability/delay/attempt limits, and malformed success payloads; run red.
- [ ] Implement the minimal schemas and checked spec loaders; rerun green.
- [ ] Write golden-vector and repeatability tests that hand-assert fault results for healthy, latency, 503, 429, disconnect, malformed, burst, and unsafe-mutation fixtures; run red.
- [ ] Implement FNV-1a-based stream derivation, immutable workload planning, and pure fault evaluation using a documented operation ordinal convention; rerun green and the complete package suite.

### Task 3: Baseline execution and telemetry projections

**Files:**
- Create/test: `packages/resilience-core/src/ports/*.ts`, `packages/resilience-core/src/baseline/*.ts`, adjacent tests
- Create/test: `packages/telemetry/src/*.ts`, adjacent tests

**Interfaces:**
- Produces `Clock`, `Transport`, `BaselineRunInput`, `runBaseline(input, dependencies): Promise<RunSnapshot>` and normalized attempt classification.
- Produces bounded `createTelemetryCollector(maxEvents)`, `projectMetrics(events)`, and nearest-rank percentile calculations.

- [ ] Write telemetry tests for p95 `[100,200,300,400,500] => 500`, `8/5 => 1.6`, empty metrics as `null`, bounded-log warnings, and stable `(atMs, sequence)` ordering; run red.
- [ ] Implement append-only telemetry and derived metrics; rerun green.
- [ ] Write baseline tests for healthy success, injected 503, disconnect, malformed 200, abort classification, one physical attempt per Phase 01 operation, and injected-clock traces; run red.
- [ ] Implement the minimal transport/clock ports and baseline orchestrator without any retry or breaker policy; rerun green and the full unit suite.

### Task 4: Browser fixture, Hono API, and semantic parity

**Files:**
- Create/test: `apps/lab/src/modules/experiment/adapters/fixture-transport.adapter.ts`, adjacent test
- Create/test: `apps/lab/src/modules/experiment/adapters/http-transport.adapter.ts`, adjacent test
- Create/test: `apps/chaos-api/src/app.ts`, `apps/chaos-api/src/index.ts`, adjacent tests
- Create/test: `tests/contract/transport.contract.test.ts`, `tests/integration/hono-parity.test.ts`

**Interfaces:**
- Both adapters implement `Transport.execute(input, signal)` and return/throw the same normalized semantic outcomes.
- Hono exposes bounded `GET /healthz`, `GET /v1/scenarios`, and validated `POST /v1/execute` with local allowlist CORS.

- [ ] Write shared adapter contract tests for every checked-in scenario plus explicit no-fetch fixture behavior; run red.
- [ ] Implement abortable fixture execution over the shared fault evaluator; rerun the fixture contract green.
- [ ] Write Hono boundary/parity tests for bad content type, oversized/invalid JSON, unsupported version, malformed success body, status/retryability, and shared synthetic identity; run red.
- [ ] Implement Hono request translation and the HTTP adapter; rerun contract/integration suites green.

### Task 5: Run lifecycle, Quasar screens, and accessible evidence

**Files:**
- Create/test: `apps/lab/src/modules/experiment/experiment.store.ts`, `run-baseline.ts`, adjacent tests
- Create: `apps/lab/src/modules/experiment/components/*.vue`
- Create/modify: `apps/lab/src/layouts/MainLayout.vue`, `apps/lab/src/pages/{IndexPage,SimulatorPage,PatternsPage}.vue`, router files
- Create/modify: `apps/lab/src/css/{quasar.variables.scss,app.scss}`, `apps/lab/public/**`

**Interfaces:**
- The experiment store exposes selected scenario/seed/mode, run status/snapshot/error, `run()`, and `reset()`; it owns one generation token and AbortController.
- Components render real metrics and trace rows and dispatch actions without implementing domain policy.

- [ ] Write store tests proving run state transitions, local-mode recovery messages, and stale-result suppression after reset/new run; run red.
- [ ] Implement the generation-guarded lifecycle and adapter selection; rerun green.
- [ ] Build `/`, `/simulator`, and `/patterns` from the shared experiment surface; integrate the real 503 baseline and reset/replay flow.
- [ ] Add the supplied logo/favicons, semantic SCSS tokens, textual status/live regions, focus/reduced-motion handling, desktop/tablet layouts, and phone read-only notice.
- [ ] Add a Circuit Breaker Console preview labeled Phase 03 with no functional breaker controls or invented breaker state.
- [ ] Run component/integration tests, lint, and typecheck; resolve only Phase 01 defects.

### Task 6: Reviewer journey, delivery scripts, documentation, and phase gate

**Files:**
- Create/test: `tests/e2e/phase-01-baseline.e2e.ts`, `playwright.config.ts`
- Create/modify: `scripts/{seed,reset,codegen,verify}.*`, `.github/workflows/ci.yml`
- Modify: `README.md`, `CHANGELOG.md`, `docs/toolchain.lock.md`, `docs/architecture/*.md`, `docs/runbooks/*.md`, `agent/{HANDOFF,ACCEPTANCE-CHECKLIST}.md`

**Interfaces:**
- Produces a fixture-only E2E journey that runs default 503, inspects metrics/timeline, resets, and replays normalized outcomes.
- Produces a truthful `pnpm verify` gate and Quasar production/demo artifacts using hash routing and a configured public path.

- [ ] Write the Playwright journey and run it red before the UI contract is complete.
- [ ] Complete selectors/accessible names needed by the reviewer workflow and rerun E2E green on desktop and phone read-only coverage.
- [ ] Implement seed/reset/codegen scripts as real validation/reset actions and add least-privilege CI using frozen installs.
- [ ] Record exact installed versions, lockfile checksum, build output, architecture/data flow, setup/reset/recovery, known limitations, and actual command results.
- [ ] Run `pnpm install --frozen-lockfile`, focused tests, `pnpm verify`, and full-local parity smoke; fix any observed Phase 01 regressions.
- [ ] Mark acceptance items only when evidenced, update the handoff, and report release/tag readiness without beginning Phase 02.
