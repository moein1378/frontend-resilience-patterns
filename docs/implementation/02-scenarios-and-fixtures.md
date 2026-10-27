# Deterministic scenarios, fairness and fixtures

## What source requires

The original blueprint specifically requires deterministic seeds; failure profiles for latency, timeout, status bursts and malformed responses; comparable baseline/protected runs; controlled latency/error/disconnect/burst/rate-limit; and independent fixture and Hono runtimes.

## Proposed executable model

A **scenario** is a versioned read-only input containing `id`, `title`, `seed`, `faultProfile`, `workloadId`, an optional policy selection and safe numerical caps. `workload` lists logical operations with unique IDs, classification (`read`, `safe-mutation`, `unsafe-mutation`, `polling`), arrival times and payload shape. `attempt` is each physical transport invocation of that logical operation; one operation can have many attempts.

**Reproducibility definition:** For one normalized input and seed, the same immutable logical arrival schedule and the same mapping of `(operationId, attemptIndex, endpoint)` to fault outcomes must be produced in the browser and on Hono. Protected retry/hedge may cause extra attempts (which have their own deterministic outcomes); therefore the upstream attempt stream need **not** be identical, but the underlying chaos function is.

## PRNG recommendation

Use FNV-1a 32-bit hash for stable string-to-seed (or equally documented portable integer hash) followed by one specified uint32 PRNG (e.g., Mulberry32) whose outputs are independently golden-tested across browser and Node. No unseeded `Math.random()` in run decisions. Do not put `Date.now()` into a seed. Policy jitter uses separately derived random streams per operation so retry count changes in one operation cannot drift outcomes of another.

```text
baseSeed = hash32(`${scenario.seed}|${scenario.id}|${scenario.version}`)
operationSeed = hash32(`${baseSeed}|${operation.id}`)
faultSeed = hash32(`${operationSeed}|attempt:${attemptIndex}|endpoint:${endpoint}`)
jitterSeed = hash32(`${operationSeed}|jitter:${attemptIndex}`)
```

Hashing scheme is a **proposed default**; Codex must write tests verifying a documented reference vector and resist silently changing it between releases. Distinct `runId` should not alter chaos outcomes.

## Scenario profiles and deterministic examples

See `specs/scenarios.json` and `specs/workloads.json` for machine-readable examples. Baseline recommended demos:

1. `healthy-baseline`: ordinary GET reads; low fixed delay; no failure; positive control.
2. `latency-spike`: 80–1000ms varying deterministic latency; show p95 and timeout budget.
3. `intermittent-503`: seeded or fixed attempt-index errors; retry eligibility.
4. `throttled-429`: server-supplied `Retry-After` with bounded sensible policy; avoid storm.
5. `connection-drop`: simulated rejection without response; UI describes network failures.
6. `malformed-payload`: validation rejects a nominal 2xx response; never treat it as success.
7. `dependency-burst`: bursty arrival schedule; queue and shedding proof.
8. `unsafe-mutation`: simulated non-idempotent write; retry/hedge must be blocked by default.

Allow fault profiles with `fixed` / `sequence` / `seeded-probability` modes, named clearly; static fixtures use no uncontrolled external randomness. Limit operations (recommended max 200/run), delay (max 10,000ms), attempts (max 5), schedule (max 60s), event buffer (e.g. 20,000) to prevent UI stall/unbounded CI.

## Controlled replay

- Exact same scenario version, seed, workload, logical IDs, schedule and fault map in baseline/protected.
- Each run gets its **own stateful policy instance**. Never reuse breaker or token bucket state across baseline/protected unless explicitly testing shared-state behavior.
- Run can be `queued | running | cancelling | completed | cancelled | failed`; reset cancels all timers and transport attempts.
- Run snapshots store normalized inputs, effective policy, version, metrics definitions, raw bounded event list and generated app version.
- Replay handles obsolete schema version via a migration or explicit read-only legacy note.

## Fixture/Hono parity

The same `packages/failure-scenarios` evaluator is imported by both. Use a contract suite over `specs/` to assert consistent response body, status code, semantic error and fault decision. Browser has controlled virtual clock where meaningful; Hono typically real-time delays; tests should compare **logical outcomes**, not precise wall clock jitter. Server security caps apply to all malformed/out-of-range parameters.

## Seed/reset

`pnpm seed`: validate repository-owned JSON fixtures and refresh local generated sample snapshots only when deterministic. `pnpm reset`: clear app-owned local storage/IndexedDB cache/run snapshots (with a UI Reset button); it **must not** delete other sites' data or the developer's personal files. CLI reset documents how to reset browser state or launch a clean context.
