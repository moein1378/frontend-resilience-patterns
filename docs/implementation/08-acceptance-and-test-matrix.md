# Test cases, CI matrix, quantitative acceptance

Tests are **planned cases**, not executed results in this bundle. Test names below are suggestions Codex should implement as automated invariants; record actual commands and results after scaffold.

| ID | Phase | Test stimulus | Expected invariant |
|---|---|---|---|
| SCN-01 | 01 | same input/seed twice | same fault schedule and normalized logical outcomes |
| SCN-02 | 01 | same fixture via in-browser + Hono | same fault classification/status/payload identity |
| SCN-03 | 01 | malformed nominal HTTP 200 | validation failure, no logical success |
| SCN-04 | 01 | route reset before old request resolves | old result never alters new run view |
| SCN-05 | 01 | missing Hono service while in Fixture | baseline still completes; no silent localhost call |
| TEL-01 | 01 | 5 durations 100–500ms | nearest-rank p95 = 500ms |
| TEL-02 | 01 | 5 logical ops, 8 attempts | amplification 1.6x |
| RET-01 | 02 | 503 for read then 200 | bounded retry succeeds, attempts counted |
| RET-02 | 02 | 503 for unsafe mutation | no duplicate physical attempt without dedupe contract |
| RET-03 | 02 | cancel in backoff | no subsequent transport invocation |
| RET-04 | 02 | deadline < next backoff | stop on deadline; no over-budget request |
| RET-05 | 02 | same seed jitter streams | repeatable delays; ops independent |
| CB-01 | 03 | window threshold reached | transition closed→open and trace emitted |
| CB-02 | 03 | request while open | zero actual upstream attempts |
| CB-03 | 03 | many simultaneous at cooldown | exactly 1 half-open probe owner |
| CB-04 | 03 | successful/failed probe | close/reopen correct + counters reset |
| BUL-01 | 04 | burst > configured active | active count never exceeds limit |
| BUL-02 | 04 | queued request aborts | queue removes and permit never leaks |
| BUL-03 | 04 | unrelated healthy dependency | no starvation caused by failed resource pool |
| RL-01 | 04 | virtual 500ms refill step | bounded token math; no negative tokens |
| SHED-01 | 04 | queue exceeds capacity | explicit shed outcome; no fake success |
| FB-01 | 05 | fresh miss, stale payload under maxStale | served with visible stale age/source |
| FB-02 | 05 | stale exists for mutation | no unsafe action enabled/committed |
| FB-03 | 05 | late background refresh after reset | no old state resurrected |
| OPS-01 | 06 | Pages subpath reload / direct navigation | fixture route resolves, JS/CSS/favicons load |
| OPS-02 | 06 | no network/Cloudflare account | public fixture still runs experiment |
| OPS-03 | 06 | CI secret scan + least-privilege permissions | no secret sample / deploy token leaks |
| V1-01 | 07 | new clone with Node24 and locked pnpm | install/seed/verify/build:demo passes |
| V1-02 | 07 | e2e pattern tour | 7 core pattern routes produce real trace evidence |
| V1-03 | 07 | mobile read-only + keyboard + reduced-motion | usable without color-only state or keyboard trap |

## CI gate contract

`install --frozen-lockfile → format/lint/docs → architecture:check → typecheck → unit/property → adapter contract/integration → Playwright E2E → build → bundle budget → secret/dependency scan`. Final `pnpm verify` must invoke actual checks, never merely print a success banner. Configure Playwright webServer(s) deterministically and avoid test data contention by run-scoped fixture IDs.

## Key fixture assertions

- `specs/experiment.schema.json` validates the expected experiment shape; runtime Zod schemas must match semantic constraints.
- `specs/scenarios.json` is versioned; tests should reject unknown schema versions, duplicate IDs, impossible probabilities, negative delays, out-of-range attempts.
- Instrument normalized `TraceEvent` rather than comparing wall-clock latencies from two separate machines.

## Performance target and limitations

Source budget: initial shell JS <=200KB gzip for standard apps, route-lazy heavy modules. This is a **target** to measure on actual artifact and report rather than falsely certify. If Quasar framework output can't meet shell-only interpretation, capture measured artifact map and ADR for a realistic split, not a skipped budget. No universal Lighthouse scores are claimed in advance.

## Suggested Playwright journeys

1. `first-reviewer-baseline`: load `/`, select default seeded 503, start baseline, see failure, timeline, Reset, replay identical.
2. `protected-retry-comparison` (Phase 02): same seed read GET, trace 1+ attempts, explain amplification, compare with baseline.
3. `breaker-recovery` (Phase 03): induce enough failures, observe state open → cooldown → half-open single probe → close.
4. `bounded-burst` (Phase 04): queue fills, explicit rejection, later permits recovered.
5. `stale-readonly` (Phase 05): last-good read persists visibly as stale; unsafe mutation disabled.
6. `pages-smoke` (Phase 06): fetch deployed artifact on its actual subpath and navigate refresh safely.
