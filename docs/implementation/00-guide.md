# Implementation specification index

**Original source:** `01-blueprint.md` through `11-engineering-policies.md`, `phases/`, `brand/`, and `reference/portfolio-standards/`.

**This folder:** additional, Codex-focused design decisions and testable contracts, authored from those originals. Where a detail is not present in the source it is clearly a proposed default, not a source quotation. These docs do **not** mean the code is already built.

| File | Use |
|---|---|
| `01-architecture-and-layout.md` | Workspace/package DAG, boundaries, directory targets, events/adapter data flow |
| `02-scenarios-and-fixtures.md` | Seed, deterministic fault generation, workload taxonomy, golden fixture and replay |
| `03-domain-and-algorithms.md` | State transitions, retry/timeout/breaker/bulkhead/rate/fallback invariants |
| `04-transport-and-hono-contract.md` | Browser fixture, Hono HTTP contract, safety, server parity |
| `05-telemetry-and-metrics.md` | Attempt vs operation metrics, event/timeline, sample calculation |
| `06-ui-and-interaction.md` | Pages, visual hierarchy, controls, states, responsive/a11y |
| `07-phase-by-phase-work-orders.md` | Seven sequential work orders with concrete DoD and dependency gates |
| `08-acceptance-and-test-matrix.md` | Named deterministic test cases, CI quality gates |
| `09-ci-deploy-and-ops.md` | Actions, Pages, security, runbooks, Docker choice, rollback |
| `10-documentation-and-showcase.md` | README, diagrams, learning narratives, portfolio evidence |
| `11-reliability-and-security.md` | threat model, safety, privacy, perf, anti-patterns |
| `12-assumptions-and-open-decisions.md` | Source vs proposed defaults; deferred choices |

## Core principles

- Educational comparison, not production-ready generic library (Tern is planned for that purpose).
- Failures are **reproducible**, **legible** and **truthfully labeled**.
- The baseline and protected paths have equivalent *logical* inputs. Protection can alter physical attempts; record this distinction.
- Use injected clock/PRNG/transport. Avoid hiding timeout/retry policy inside components.
- Express operational claims as **measured experiment output**, never invented performance numbers.
- Every pattern explains **when not to use it** and what overhead it introduces.
- No third-party API, opaque sample telemetry, company-specific details, private data, or expensive infrastructure.

## Authoritative review path

`README.md` → select a failure scenario → run baseline → inspect failure timeline → enable a valid protection (when its phase exists) → re-run same scenario/seed → compare user outcomes and upstream cost → read trade-offs → export a bounded experiment result.
