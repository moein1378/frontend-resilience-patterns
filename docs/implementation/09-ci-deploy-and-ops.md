# CI/CD, GitHub Pages, local operations and release strategy

## CI is a reproducibility gate, not decoration

Use GitHub Actions on pull requests and pushes to `main`: Node24; enable pinned pnpm **before cache resolution** if needed; `pnpm install --frozen-lockfile`; execute `pnpm verify`; publish test/artifact evidence when useful. Minimum GITHUB_TOKEN `contents: read`; never expose repo/cloud secrets to untrusted pull requests. Keep job timeouts and CI concurrency cancellation. Dependency review/secret scanning should fail on real issues, with an explicitly documented false-positive policy.

Source templates at `templates/.github/workflows/` are examples only. Their `dist` artifact path is generic and the Quasar CLI output path must be discovered from the real build (`apps/lab/dist/spa` or measured actual target). `actions/setup-node` pnpm caching may break if pnpm activation occurs afterwards; validate and fix. Source Dockerfile is a placeholder; **do not** treat it as production-ready.

## Required scripts after implementation

- `pnpm dev` — Quasar SPA fixture mode without Hono dependency.
- `pnpm dev:all` — Quasar + Hono via a documented cross-platform command; stop both on Ctrl+C.
- `pnpm seed` — validate deterministic fixtures and regenerate derived snapshots/checksums if any.
- `pnpm reset` — documented project-scoped browser/fixture reset; no deleting broad user storage.
- `pnpm codegen` — regenerate types/schema when used, or explicitly verify generation is not needed.
- `pnpm lint`, `pnpm architecture:check`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e` — actual non-no-op checks.
- `pnpm build` — Quasar build + Hono build if activated.
- `pnpm build:demo` — fixture-only Quasar output with correct subpath/relative assets.
- `pnpm verify` — all relevant static/build/test checks, same process in CI.

## GitHub Pages deployment

- Target repository name: `frontend-resilience-patterns`; derive actual path from repository, don't hardcode account or URL.
- Publish Quasar SPA fixture artifact only after CI green on main. Use `quasar.config.ts` for `build.publicPath` derived from Pages path; no secondary `vite.config.ts`.
- Hash routing default (e.g. `/#/simulator` behind `/<repo>/`) avoids static-host rewrite requirements. Document why deep history routes would otherwise 404.
- Verify base assets, brand SVG/favicon, app startup, default baseline case, navigation, Reset via smoke.
- Deploy permissions: `contents:read`, `pages:write`, `id-token:write` only for deploy job; concurrency `pages` group, no personal token.
- Store previous release artifact/tag and write documented manual rollback steps; don't claim automatic rollback if not implemented.

## Hono and optional Docker

Hono direct Node mode is primary for full-local. If Docker adds meaningful reproducibility, build a **service-only** non-root multi-stage Dockerfile referencing the actual Hono entrypoint and workspace lockfile; expose `3001` and `/healthz`; maintain a real Compose file. No container needed for browser static site. Never deploy public chaos endpoint with unbounded users/fault delays; optional Worker is limited, rate-capped and protected appropriately.

## Security and ops

- Enforce explicit local origin allowlist. Never set permissive CORS with credentials.
- Validate all incoming scenario fields and cap payload bytes, operations, concurrency, timers, event count.
- Use Dependabot/Renovate after baseline is stable; do not auto-upgrade major versions during active phase.
- Capture artifact size, E2E screenshots, dependency/license notes, vulnerability scan results when available.
- No analytics by default; no employer endpoints or real personal data.

## Release notes / tags

- Keep `main` releasable. Small conventional commits like `feat(phase-01): ...`, `test(phase-01): ...`, `docs: ...`.
- Changelog entries for every phase (`v0.1.0`, `v0.2.0`, `v0.3.0`, `v0.4.0`, `v0.5.0`, `v0.9.0`, `v1.0.0`).
- Tag only after `pnpm verify` and deployed smoke (when deployment is part of current phase), user permissions and safety.
- README demo link only once a real deployment exists; no placeholder URL presented as live.
