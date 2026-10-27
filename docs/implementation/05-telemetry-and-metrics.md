# Telemetry, aggregation, visual proof and pitfalls

## Canonical trace events

A chronological event is an immutable record with at least `schemaVersion`, `runId`, `side` (`baseline|protected`), `atMs` (nonnegative relative clock time), `operationId`, optional `attemptIndex`, `kind`, `status/outcome`, and structured `details`. Proposed kinds:

- `run-started`, `logical-operation-started`, `attempt-started`, `attempt-finished`, `attempt-aborted`
- `retry-scheduled`, `timeout-deadline`, `breaker-transition`, `breaker-rejected`, `permit-queued`, `permit-acquired`, `permit-released`, `load-shed`, `token-refilled`, `fallback-served`
- `logical-operation-finished`, `run-cancelled`, `run-finished`.

Stable event tie-breaker: `(atMs, sequence)`; `sequence` increments per run. The log is bounded; if truncated expose event count and warning, never show partial data as comprehensive.

## Non-negotiable metric definitions

| Metric | Definition / denominator |
|---|---|
| `logicalSuccessRate` | successful user-visible logical operations / completed logical operations (exclude deliberately cancelled) |
| `upstreamAttempts` | physical execute() invocations begun, including retries and hedges; breaker-denied/queue-rejected calls are **not** upstream attempts |
| `upstreamErrorRate` | failed physical attempts / finished physical attempts; aborted counts separately |
| `p50LatencyMs`, `p95LatencyMs` | **completed logical** end-to-end duration from scheduled/admitted start to user-visible finish; disclose if cancels excluded |
| `queueDepthPeak` | maximum waiting queue entries, excludes active permit holders |
| `policyRejected` | logical ops prevented before a physical upstream call; label separately from network/service errors |
| `freshnessAgeMs` | for served stale results: `now - originTimestamp`, nullable for fresh/unavailable; also report count served stale |
| `retryAmplification` | upstreamAttempts / logical operations that started, even if protected caused extra work |
| `breakerStateTime` | time spent closed/open/half-open in that run; only once breaker is implemented |

All percentages show numerator and denominator in UI accessible table or tooltip. Empty sample set => `N/A`, not `0ms`. Compare metrics only with same scenario version/seed/workload and explicit policies.

## Percentile definition

For sorted n completed logical durations, nearest-rank p95: index `ceil(0.95*n)-1`, clamped into `[0,n-1]`; `n=0 => null`. For large sets use bounded exact arrays under run caps, not arbitrary histogram approximation. Clearly label that browser fixture timing is **simulated time**, not real network benchmark. If real clock mode is enabled, mark it separately.

## Concrete numeric sanity example

For logical operation latencies `[100, 200, 300, 400, 500]` ms (all successful), `logicalSuccessRate=5/5=100%`, `p95=500ms` by nearest-rank. If 5 logical operations issue 8 upstream attempts, `retryAmplification=8/5=1.6x`. A breaker rejection can reduce upstream count while decreasing user success; always show both metrics.

## Experiment comparison view

- Side-by-side summary, aligned timeline (same relative zero), shared axis units and filters.
- Primary metric: user-visible success; secondary: p95, upstream attempts, retry cost, queue depth, freshness, policy rejections.
- Baseline vs protected must share scenario/seed, not stateful policy instances.
- Explanatory copy: improvement, trade-off, and **when protection can hurt**.
- Every chart has table and export; don't convey states only by color.
- If a metric's sample is too small or all cancelled, show explanatory insufficiency warning.

## Export and privacy

JSON export is schema-versioned and includes scenario input, policies, tool/app version, metrics definition version and bounded event log. CSV timeline export contains no user/credential data. Validate imports; handle schema incompatibility with explicit error instead of loose coercion.
