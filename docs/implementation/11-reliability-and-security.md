# Threats, safety, privacy and performance

## Threat model

1. **Untrusted scenario imports:** JSON can carry huge counts, bad numeric values or unexpected HTML → schema-validate, bound sizes, escape text, never eval/execute content.
2. **Hosted chaos endpoint abuse:** malicious request floods or long sleeps → public Worker optional, rate/concurrency caps, maximum delay/body, safety timeouts; local Hono intended for local testing.
3. **Cross-origin localhost probing:** fixture on GitHub Pages must not fetch localhost automatically; explicit mode switch plus user confirmation, allowlist when Hono is used.
4. **Mutation duplicates:** logical operation retry/hedge can create double effects → disallow unsafe mutation automatically unless a real deduplication mechanism is available and tested. Label simulated semantics.
5. **Stale data as truth:** stale fallback may be mistaken for live → display origin/time/age/read-only status, ensure no hidden mutation side effect.
6. **Misleading telemetry:** success rate denominator confusion and client/server timing mix → define terms, separate simulated from wall-clock, store raw events.
7. **Resource leaks:** timers, AbortControllers, queue entries, event listeners and optional workers → dispose on route change/reset/unmount; bounded event logs, result list, retries.
8. **CI and dependency supply-chain:** lockfile, minimum permissions, secret scanning, no arbitrary scripts from untrusted fixtures, review major updates.

## Failure UX rules

An error can end a logical operation and may trigger fallback, but cannot be reported as true fresh success. Policy denial is not an upstream network error. An incomplete Hono response or invalid body is a typed failure. Cancellation is separate from failure in breaker metrics.

## Accessibility requirements

Keyboard operation, visible focus, semantic status regions (`role=status`/live region where appropriate), accessible tables mirroring every chart, non-color status labels, `prefers-reduced-motion`, testable 44px mobile touch targets, responsive text, no traps.

## Performance / resource accounting

- Starting budget from source: standard SPA shell ≤ 200KB gzip **as a target**; measure and document actual chunks, especially Quasar.
- Lazy-load graph/timeline renderers and heavy modules; avoid loading every pattern's visualization on landing.
- Deterministic simulation caps: suggested 200 operations/run, 20k trace events, 10s max delay, 5 attempts, 60s schedule. Use checks before scheduling.
- The fixture's virtual time/clock is not real API latency; never call it a benchmark or SLA result.
- Cleanup must be covered by a test that resets during a pending asynchronous operation.
