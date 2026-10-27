# Frontend Resilience Patterns — Versioned Phase Index

Every phase is a runnable vertical slice. Do not begin the next phase until the active phase exit criteria pass and the release tag exists.

- [`v0.1.0 — Chaos Harness and Failure Model`](phases/01-v0.1.0-chaos-harness-and-failure-model.md)
- [`v0.2.0 — Timeouts and Retry Discipline`](phases/02-v0.2.0-timeouts-and-retry-discipline.md)
- [`v0.3.0 — Circuit Breaker`](phases/03-v0.3.0-circuit-breaker.md)
- [`v0.4.0 — Bulkheads and Rate Control`](phases/04-v0.4.0-bulkheads-and-rate-control.md)
- [`v0.5.0 — Fallback and Degraded UX`](phases/05-v0.5.0-fallback-and-degraded-ux.md)
- [`v0.9.0 — Deployment and Operational Hardening`](phases/06-v0.9.0-deployment-and-operational-hardening.md)
- [`v1.0.0 — Stable Pattern Reference`](phases/07-v1.0.0-stable-pattern-reference.md)

## Release discipline

- `v0.1.0–v0.5.0`: additive development milestones.
- `v0.9.0`: release candidate with deployment, documentation, compatibility, and supply-chain checks.
- `v1.0.0`: stable public contract or stable portfolio product.
- Scope not listed in a phase belongs in the backlog, not the current implementation.
