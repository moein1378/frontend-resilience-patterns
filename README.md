<div align="center">
  <img src="./brand/logo-filled.svg" alt="Frontend Resilience Patterns logo" width="88" />
  <h1>Frontend Resilience Patterns</h1>
  <p><strong>A visual lab for resilient frontend systems</strong></p>
  <p><a href="https://moein1378.github.io/frontend-resilience-patterns/"><strong>Open the live demo →</strong></a> · <a href="https://github.com/moein1378/frontend-resilience-patterns/actions/workflows/ci.yml">CI and deployment status</a></p>
</div>

Explore client-side failures, recovery policies, and their trade-offs by running the same seeded workload against unprotected and protected request paths. Inspect attempts, user-visible outcomes, state changes, and timeline evidence.

The demo runs in your browser using fixtures, with no backend setup. Every push to `main` runs verification and publishes the demo after the checks pass. See the [demo deployment guide](docs/runbooks/live-demo.md) for the one-time GitHub Pages setup.

## Development

Requires Node.js 24+ and pnpm 11.

```bash
pnpm install
pnpm dev:all
```

Use `pnpm dev` for the fixture-backed lab only, or `pnpm dev:all` to run both the Hono chaos API and the Quasar/Vue lab.

## Validation

```bash
pnpm verify
```

Architecture notes and operational runbooks live in [`docs`](docs/).

## Current phase

Phase 02 — Timeouts and Retry Discipline is implemented. Open **Retry and Jitter Lab** (`/#/retry-lab`) to compare a single attempt, synchronized retries, and seeded full jitter. Configure a shared deadline and bounded retry policy, inspect attempt traces, or export the comparison JSON. Select **Synchronized retry storm** for ten simultaneous reads against persistent 503 failures.

Only safe GET reads retry; mutations remain single-attempt. Phone view supports replay. Fixture mode requires no API. Local mode uses `pnpm dev:all`. Circuit-breaker behavior starts in Phase 03.

Policy bounds, cancellation semantics, Retry-After support, metric definitions, and timing limitations are documented in [retry policy architecture](docs/architecture/retry-policy.md). The local `blue-print/` source folder is intentionally ignored by Git.
