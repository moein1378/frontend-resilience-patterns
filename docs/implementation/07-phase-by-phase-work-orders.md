# Seven chronological Codex work orders

**Source authority:** `phases/01-...` through `phases/07-...` remain the original milestone objectives. These extra checklists clarify acceptance and implementation boundaries; they do not authorize starting later phases early.

## Phase 01 — `v0.1.0`: Chaos Harness and Failure Model

**In:** Quasar SPA scaffold in workspace, Hono fixture API, schema/typed ports, seeded fault profiles (latency, timeout, status bursts, malformed), read workload, baseline transport, trace/metric event contract, Reset/seed, starter catalog and Circuit Breaker *preview*, responsive shell, real unit/contract/E2E/CI gate.

**Acceptance:** fixture needs no API; identical seed+scenario baseline produces identical fault classes and logical traces; Hono adapter yields equivalent logical outcomes; malformed payload 2xx not successful; resetting while pending doesn't commit stale results; `pnpm verify` real. **Out:** retry/timeout policy, actual breaker states, bulkhead, rate limiter, fallback, hosted Worker.

**Deliverables:** lockfile and toolchain notes, screenshots of baseline failure + trace (after working), package DAG, `AGENTS.md` preserved, reproducible setup runbook and phase handoff.

## Phase 02 — `v0.2.0`: Timeouts and Retry Discipline

**In:** shared operation deadline, precise cancellation semantics, retry eligibility classification, capped exponential backoff/full jitter, attempt traces, UI knobs, compare same-seed runs, deterministic retry storm example. **Tests:** abort during backoff, exhaustion, bounded `Retry-After`, unsafe mutation no retry, p95 measured on logical operations, end-to-end protected comparison. **Out:** breaker state machine until Phase 03.

## Phase 03 — `v0.3.0`: Circuit Breaker

**In:** closed/open/half-open per-resource machine, rolling failure window, min samples, exclusive probe, configurable cooldown, transition history, state diagram/accessible table. **Tests:** threshold open, short-circuit no upstream calls, cooldown/probe single-owner with concurrency, abort neutral, recovery, reset isolation. **Out:** semaphore bulkhead/rate bucket until Phase 04.

## Phase 04 — `v0.4.0`: Bulkheads and Rate Control

**In:** per-resource semaphore, bounded FIFO queue with cancellation, token bucket with injected clock, explicit admission/rejection, load shedding, burst and polling workloads. **Tests:** no permit leak, active count max, fair queue order, full queue rejects, refill math, one bad resource doesn't starve healthy one. **UI:** queue depth vs successful operations. **Out:** stale cache and degraded UX until Phase 05.

## Phase 05 — `v0.5.0`: Fallback and Degraded UX

**In:** stale cache, stale-while-revalidate for reads, read-only/partial-data fallback, freshness labels, recovery without duplicate commits; `/results` versioned local snapshots, import/export/clear where feasible. **Tests:** stale age/TTL, mutation disabled under degraded state, revalidation single-flight/cancellation, old response doesn't overwrite new, schema migration errors. **Out:** mandatory hosted Worker not allowed; advanced hedge remains opt-in only if risks are shown.

## Phase 06 — `v0.9.0`: Deployment and Operational Hardening

**In:** static GitHub Pages fixture with correct base/hash, optional Worker adapter if justified, CI fault matrix, security scan, deterministic bundle budgets, performance notes, operational runbook, screenshot/README. **Tests:** Pages smoke on stable route, no network requirement for fixture, secrets absent, rollback runbook, full-local parity and chaos faults. **Out:** no mandatory cloud endpoint.

## Phase 07 — `v1.0.0`: Stable Pattern Reference

**In:** freeze public contracts/schema, decision matrix, anti-pattern/reference catalog, accessibility audit, clean-clone end-to-end verification, documented limitations, publish stable README/demo screenshots, release notes and tag. **Tests:** full browser flow for all seven core patterns; negative safety invariants; all toolchain/fixture/rollback commands verified; successful public demo smoke. **Out:** no surprise production library conversion or unrelated feature explosion.

## Universal phase exit gate

1. One runnable reviewer-visible vertical slice; no placeholder success UI.
2. Unit+integration+E2E evidence for any new safety/algorithm invariant.
3. `pnpm verify` passing (document if blocked); source docs, ADRs, runbooks and handoff updated.
4. Fixture and full-local smoke where applicable; no paid hosted dependencies.
5. Changelog/known limitations/phase release notes; clean git changes.
6. Tag `vX.Y.Z` only after acceptance; if Codex cannot push/create tag, leave exact commands and report release-ready instead.
