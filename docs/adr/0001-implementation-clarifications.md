# ADR-0001 — Clarifications required by Project 02 handoff

- Status: **Accepted as proposed implementation guidance in this handoff**; Codex should preserve it unless new documented contradictory evidence or explicit user instruction justifies a replacement ADR.
- Date: 2026-10-21
- Scope: only Frontend Resilience Patterns #02.

## Source issues and resolutions

1. **`apps/lab` vs `apps/web`:** `10-repository-map.md`'s authoritative root tree and directory descriptions use `apps/lab`, while its generic internal example says `apps/web`. **Decision:** use `apps/lab` and mirror its internal `src/boot`, `layouts`, `pages`, `modules`, `router`, `css` conventions. Do not create both apps.
2. **Premature pattern surfaces:** Phase 01 says the Circuit Breaker Console appears, but its `closed/open/half-open` logic is explicitly Phase 03. Phase 03 mentions a bulkhead surface before bulkhead logic arrives in Phase 04. **Decision:** allow clearly labeled, accessible design preview/navigation and baseline metrics only; defer algorithmic features until the assigned phase. No fake toggles, fake success or synthetic proof labeled as implemented.
3. **Source phase 'activated modules' noise:** Some phase files auto-list patterns not implemented in the in-scope deliverables (e.g. circuit breaker under Phase 01). **Decision:** specific phase release objective and deliverables supersede a generic module list; package directories may be created for interfaces only. Document any expansion.
4. **Dark palette described as light:** `03-design-tokens.md` defines `--color-surface #111827`, `--color-canvas #030712`, and near-white text, but labels `--color-surface` a 'main light surface'. **Decision:** initial app is dark-theme-first following actual token values. Optional light mode must be separately designed with contrast checks; do not invert unrelated tokens ad hoc.
5. **Route templates vs 'surfaces':** Source names nine primary route templates (including four dynamic variants) and six general UI surfaces. **Decision:** implement the literal nine route template families listed in `01-blueprint.md` incrementally. Compose six surfaces inside them as applicable; number of concrete URLs can exceed nine due to seven slugs.
6. **Static GitHub Pages deep links:** Original source states GitHub Pages SPA but doesn't fully specify refresh fallback. **Decision:** default to Vue Router hash history for the static fixture demo and correct Quasar `build.publicPath` for repo subpath; document trade-off. No hardcoded `/` asset root.
7. **`pnpm install --frozen-lockfile` before lockfile exists:** Source assumes completed scaffold. **Decision:** first initial scaffold resolves exact compatible dependencies and commits lockfile; all subsequent installs/CI are frozen.
8. **Generic CI/Docker templates:** Source workflow has placeholder build directory `dist` while actual Quasar CLI output may differ, and setup-node pnpm caching may require pnpm to be activated earlier. Source Docker sample references `dist/server.js` and `app` although actual packages are `apps/chaos-api` etc. **Decision:** do not copy these verbatim as finished delivery. Adapt to actual verified build outputs and Hono entrypoint; Docker only for server if justified.
9. **Public demo and Hono:** Source says Hono fixture in stack but also zero-backend public demo. **Decision:** browser fixture adapter is authoritative for public static demo; Hono is an independent full-local reference adapter with parity tests. Optional Cloudflare Worker is postponed until Phase 06, and is never mandatory.
10. **Safe mutations:** Source prohibits unsafe mutation retry/hedge without idempotency configuration. **Decision:** even an idempotency key is only meaningful when the adapter/server actually deduplicates effects; simulated UI toggle alone is insufficient. Hedged GET remains explicitly advanced and optional after core policies.

## Consequences

These decisions preserve the project thesis, authoritative stack, brand, and sequence. A different implementation requires an ADR with rationale, migration plan and tests, not a silent interpretation.
