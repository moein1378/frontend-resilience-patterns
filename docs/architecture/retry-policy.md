# Timeout and retry composition

Phase 02 adds a protected runner alongside the Phase 01 single-attempt baseline. The retry lab compares independent baseline, synchronized exponential retry, and full-jitter runs with the same scenario, seed, and workload. Circuit-breaker behavior remains Phase 03.

At logical admission (after workload arrival), each operation receives one absolute deadline. Attempts and backoff consume this shared budget. The deadline aborts the operation and settles the runner even when a transport ignores its signal. Caller cancellation is `abort`; budget expiry is `timeout`. Terminal attempt and logical events remain distinct, and late transport settlement cannot publish success. Deadline waits and abort listeners are cleaned up at settlement.

Defaults: budget 1500 ms, three total attempts, base backoff 200 ms, cap 2000 ms. Configurable bounds are budget 100–10000 ms, attempts 1–5, base 0–2000 ms, and cap between base and 10000 ms. Full jitter draws from zero up to the exponential cap. Seeded streams fork by operation ID, so concurrent completion order does not reassign random draws.

Only catalog GET reads and polling retry. Neither a safe-mutation label nor a server's retryable flag proves deduplication; all mutations stay single-attempt. Eligible transient failures are network errors, transport timeouts, and HTTP 429/500/502/503/504. Other statuses and schema-invalid payloads stop immediately.

Retry-After accepts case-insensitive delta-seconds headers from 429/503, bounded to 0–60 seconds. It is a minimum delay, combined with backoff. If the wait consumes the remaining budget, the operation times out without another attempt. HTTP-date headers are unsupported because the injected clock is monotonic; invalid or unsupported values fall back to backoff. This is an implementation clarification within the blueprint's bounded Retry-After requirement.

Logical p95 includes all attempt durations and waits. Retry amplification counts physical attempts per started logical operation. Deliberate cancellation is excluded from completed logical latency/success samples. The persistent-503 retry-storm fixture demonstrates timing dispersion and extra work; jitter cannot restore an unavailable service. Fixture faults use browser-paced timing, so UI durations are illustrative rather than a reproducible network benchmark. Deterministic timing assertions use fake clocks.
