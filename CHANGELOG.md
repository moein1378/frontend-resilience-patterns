# Changelog

## Unreleased — Phase 02 implementation

- Added verification on pushes to `main` and pull requests, automatic GitHub Pages deployment after successful checks, and a prominent README demo link.
- Added shared operation deadlines, cancellation-safe bounded read retries, capped exponential backoff and per-operation seeded full jitter.
- Added Retry and Jitter Lab with baseline/synchronized/jitter comparisons, configurable policy values, attempt traces, JSON export and phone replay.
- Added persistent-503 retry storm, deterministic safety/metrics/parity tests, store lifecycle tests and browser journeys.
- Fixed the test exclusion glob for multiple browser files and normalized files required by the formatting gate.
- Kept blueprint sources, local agent configuration, credentials, and implementation plans ignored by Git. No release tag created.

## Initial handoff

- Extracted original Project #02 source architecture, 7 milestone files, design tokens, brand and templates from original portfolio v3 archive.
- Added detailed, auditable Codex instructions, data/policy contracts, architecture clarifications, proposed fixtures and test matrix.
- **No runtime application implemented or versioned release tagged at handoff.**

## Planned releases

- v0.1.0 — Chaos Harness and Failure Model
- v0.2.0 — Timeouts and Retry Discipline
- v0.3.0 — Circuit Breaker
- v0.4.0 — Bulkheads and Rate Control
- v0.5.0 — Fallback and Degraded UX
- v0.9.0 — Deployment and Operational Hardening
- v1.0.0 — Stable Pattern Reference
