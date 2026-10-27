# Documentation requirements and senior portfolio evidence

This is a teaching lab for senior frontend engineering, not a generic UI gallery. The README should show a deterministic failure with a real trace, a protection and its downside, version badges only when real, and demo/docs/setup links only when valid.

## Public README order

1. Logo/wordmark with the provided assets, project title and one-sentence concept.
2. Real fixture demo link and screen capture **only after deployment**.
3. One concrete before/after failure showing what changes and what doesn't; include seed and configuration.
4. Broken implementation / expected protected implementation, key invariants.
5. A small state or attempt timeline generated from real run events.
6. Test cases that would detect a regression (cite repo paths).
7. Trade-offs: retry storm/load increase, breaker fast-fail effects, fallback staleness, hedging amplification.
8. When **not** to use each policy; failure classification and mutation safety.
9. Architecture/runtime diagram; deterministic fixture and Hono reference adapter.
10. Clone, install, run, seed/reset, verify, static demo build instructions.
11. A11y, privacy, performance target/measurements, CI, roadmap, release policy, sources.

## Required diagrams

- Context/container (browser fixture, pure packages, optional local Hono).
- Phase 02 sequence (attempt → failure → backoff → retry → completion/abort).
- Phase 03 breaker state chart (closed, open, half-open; exclusive probe).
- Phase 04 queue/bulkhead resource isolation.
- Metric aggregation/data lineage to explain operation vs attempt counts.

Mermaid is allowed; diagrams must correspond to actual implementation and events, not copied conceptual pictures with impossible states.

## Reviewer-ready evidence inventory

- GIF or short video: click Run baseline, observe 503 errors, inspect timeline, replay same seed.
- Screenshots: health overview, retry comparison, circuit breaker state, bulkhead queue and stale fallback (only as implemented).
- A compact test report containing numeric counts produced by CI, not unverifiable percentages.
- A `docs/decisions` record for ambiguous policy choices; every ADR lists status/date/context/trade-off.
- A testing strategy page describing fake clock, PRNG, adapter contract and negative invariant tests.
- `CHANGELOG.md`, `CONTRIBUTING.md`, `LICENSE` (choose license consciously), security policy for server if deployed.

## Professional presentation restrictions

No invented performance claims, fabricated demo screenshot, random GitHub badge, employer code/data, or inflated production-readiness. Separate experiment/simulation results from production SLA/availability, and explain the exact scope of every number.
