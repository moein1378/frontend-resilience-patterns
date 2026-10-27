# Active Codex task brief — Phase 01 only

**Phase:** `phases/01-v0.1.0-chaos-harness-and-failure-model.md` (v0.1.0)

**Mission:** Build a functional, deterministic baseline chaos lab from scratch with Quasar SPA + optional Hono reference server. Preserve all original docs and assets. No later-phase policy logic masquerading as working.

**Must implement:**
- Root pnpm workspace; official Quasar CLI Vite scaffold `apps/lab`; TS strict; Quasar semantic SCSS and original logo/favicons.
- `apps/chaos-api` Node/Hono health + `/v1/execute`; shared contracts, failure-scenarios, telemetry packages and minimal pure core ports.
- Seeded fault profiles and logical workload generator; browser-only fixture; Hono adapter parity and bounded request validation.
- Baseline runnable `/`, `/simulator`, `/patterns`, basic accessible telemetry and timeline; Circuit Breaker Console shown only as a nonfunctional **preview**, clearly labeled as Phase 03.
- Reset/cancel race safety, normalized outcome model and measured attempt vs logical operation metrics.
- Unit/contract/integration/E2E checks, boundary enforcement and real `pnpm verify` scripts; `pnpm dev`, `pnpm dev:all`, `pnpm seed`, `pnpm reset`, `pnpm build:demo`.
- Intro documentation and actual setup instructions; lock exact dependency versions, add CI for Phase 01.

**Out of scope:** full retry/jitter, timeout policy, functional breaker, bulkhead, limiter, SWR, hedging, hosted Worker, public deployment promise before build verified.

**Expected touched paths:** `package.json`, `pnpm-workspace.yaml`, `.nvmrc`, `pnpm-lock.yaml`, `.github/workflows/`, `apps/lab/`, `apps/chaos-api/`, `packages/{contracts,failure-scenarios,telemetry,resilience-core}/`, `scripts/`, `tests/`, `docs/architecture/`, `docs/runbooks/`, `docs/toolchain.lock.md`, `README.md`, `agent/HANDOFF.md`. Do not delete `brand/`, `phases/`, `reference/` or `specs/`.

**Exit:** seeded run replay matches; Hono/fixture parity; schema invalid payload fails; reset race safe; accessible baseline screenshot/E2E; `pnpm verify` actually green. If not achieved, record exact blockers, not a fictitious v0.1.0 completion.
