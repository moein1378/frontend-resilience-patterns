<div align="center">
  <img src="./brand/logo-filled.svg" alt="Frontend Resilience Patterns logo" width="104" height="104" />
  <h1>Frontend Resilience Patterns</h1>
  <p><strong>Concept Lab · Project 2 of 17</strong></p>
</div>

> **Stack:** Quasar CLI with Vite in SPA mode + Vue 3 + TypeScript + SCSS semantic tokens; Hono chaos fixture  
> **Architecture:** Scenario-first Quasar SPA with pure policy modules and an optional local chaos API.  
> **Demo:** GitHub Pages fixture demo. Optional Cloudflare Worker chaos endpoint is documented but never required.

## What this repository proves

- `circuit breaker`
- `retry policy`
- `jitter strategies`
- `timeout budget`
- `bulkhead`

## Primary surfaces

- Pattern Catalog
- Circuit Breaker Console
- Retry and Jitter Lab
- Bulkhead and Load-shedding Lab
- Telemetry Dashboard
- Failure Timeline

## Implementation navigation

- [`Complete blueprint`](01-blueprint.md)
- [`Phase index`](02-phases.md)
- [`Design tokens`](03-design-tokens.md)
- [`Dependencies and services`](04-dependencies-and-services.md)
- [`Brand system`](05-brand-system.md)
- [`Runtime and demo`](06-runtime-and-demo-strategy.md)
- [`CI/CD`](07-ci-cd-and-delivery.md)
- [`Docker`](08-docker-strategy.md)
- [`Responsive/platform`](09-responsive-and-platform-strategy.md)
- [`Repository map`](10-repository-map.md)
- [`Engineering policies`](11-engineering-policies.md)
- [`AI agent contract`](AGENTS.md)

## Current implementation rule

Open the first incomplete file under `phases/`. Do not start a later phase until the current version has a clean `pnpm verify`, a release tag, and updated documentation.
