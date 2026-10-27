# UI specification and reviewer journey

## Presentation

Follow **existing** `03-design-tokens.md`: dark-first compact Quasar engineering console; brand orange `#F97316`, accent cyan `#06B6D4`, danger red, success green, warning amber. Display typography Space Grotesk; body Inter; mono JetBrains Mono with system fallbacks. Use original `brand/` assets. Do not replace with a generic dashboard template.

## Global shell

- App name/brand; clear navigation; visible runtime mode `Fixture / Local`.
- Persistent scenario banner: scenario ID, seed, logical workload, number of operations, failure category, Reset.
- Compact status banner: idle / queued / running / complete / cancelled / degraded / error; include textual status and focus-visible interactions.
- Primary action `Run baseline` is available in ≤2 interactions from landing. After protection available, `Compare same seed` with in-place evidence.
- Running actions disabled when incompatible; never silently rerun with changed seed. Seed change is user-controlled and visible.

## Source's **nine** primary route families

| Route | Content | Implementation milestone |
|---|---|---|
| `/` | Thesis hero, deterministic failure preview, quick-start | Phase 01 |
| `/simulator` | Workload selector, seed, latency/error/disconnect/rate controls, Run/Reset | Phase 01 baseline, expands over releases |
| `/patterns` | Seven pattern cards + decision matrix + risks | Phase 01 catalog, explanations expand |
| `/patterns/:slug/unprotected` | Baseline behavior/run controls | Phase 01 for relevant baseline, rest progressive |
| `/patterns/:slug/protected` | Available pattern controls, never nonfunctional simulations labeled real | Phase 02+ according to pattern |
| `/patterns/:slug/compare` | Shared-seed two-run metrics and trace comparison | Phase 02+ |
| `/patterns/:slug/state` | Real breaker/policy state diagram and transitions where applicable | Phase 03+ |
| `/workloads` | Read, safe/unsafe mutation, burst, polling profiles | Phase 01 basic, expanded Phase 04 |
| `/results` | Saved deterministic runs, import/export/reset | Phase 05 local persistence or sooner if lightweight |

**Suggested slugs:** `timeout-budget`, `retry-jitter`, `circuit-breaker`, `bulkhead`, `rate-limiter`, `load-shedding`, `fallback`. These slugs are a proposal; source specifies seven patterns but not canonical slugs. Once published, route changes require redirects/migration policy.

## Six named UI surfaces in the source

1. Pattern Catalog: cards classify benefit, prerequisite, failure mode and anti-pattern.
2. Circuit Breaker Console: state pill, rolling window, cooldown/probe and transition history (functional from Phase 03 only).
3. Retry and Jitter Lab: budget, eligible failures, backoff/jitter histogram, attempt trace (Phase 02).
4. Bulkhead and Load-shedding Lab: resource queue/active counts, incoming bursts, shed/reject path (Phase 04).
5. Telemetry Dashboard: numerator/denominator KPIs, p95, amplification, error counts, table (Phase 01 base instrumentation, expanded).
6. Failure Timeline: dual lanes, aligned start, accessible table, policy transitions, export (progressive).

## Responsiveness

- Desktop >=1024px: nav, experiment controls, comparison/timeline columns, inspector in multi-panel layout.
- Tablet 640–1023px: stacked/switchable telemetry panels with full controls when space permits.
- Phone <640px: **read-only scenario replay** plus access to catalog and table; explicitly explain desktop requirement for authoring/complex controls. Must still allow browse, zoom/view, keyboard, screen-reader, download where practical; avoid blank route.
- Target large interactive touch surfaces >=44px; use Quasar accessible inputs with visible labels. Respect `prefers-reduced-motion`, high contrast, visible focus.

## Critical UX states

- Empty/no scenario; loading/compiling; running; cancelled; completed-success; degraded/stale; backend unavailable (local mode); schema error; test mode unavailable; browser offline.
- Never label a successful *mock* as a real backend success: show Fixture marker and synthetic origin.
- Show a small “simulated time / not a real-world API SLA benchmark” notice near primary statistics.
- Error messages state what failed, current mode and recovery step; do not hide behind success-colored zero numbers.

## First reviewer flow

1. Land on overview with `Intermittent 503` scenario preselected.
2. Click `Run baseline` → display real deterministic failure events from fixture; show attempt/operation counts.
3. Inspect accessible timeline table, Reset and replay same seed → same output.
4. From Phase 02, enable retry + full jitter and press `Compare same seed` → show success difference and additional upstream cost.
5. Later, explore breaker, bulkhead, fallbacks, policies for unsafe writes and anti-pattern decision matrix.

## Brand incorporation and Favicon

Copy provided `brand/logo-*.svg` to correct Quasar public asset locations without modifying logos. Use original favicons sizes and `site.webmanifest` only as appropriate for SPA (do not claim PWA installation unless configured and tested). Screenshots use own sample events; no employer data.
