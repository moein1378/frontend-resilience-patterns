# Moein Mousavipour — Senior Front-End Portfolio Implementation Blueprints v3

This repository is an **AI-agent-ready implementation system**, not an idea list. It preserves the v2 product and architecture blueprints and adds operational detail required to build, test, brand, deploy, and release every project without hidden assumptions.

Each numbered project directory includes:

- `README.md` — visual entry point and navigation.
- `01-blueprint.md` — complete product and technical blueprint.
- `02-phases.md` — release map linking to one detailed file per phase.
- `phases/` — seven implementation phase files from `v0.1.0` through `v1.0.0`.
- `03-design-tokens.md` — project-specific visual tokens.
- `04-dependencies-and-services.md` — dependency and service contract.
- `05-brand-system.md` — logo concept, variants, favicon matrix, and usage rules.
- `06-runtime-and-demo-strategy.md` — local, fixture, full-local, and live-demo modes.
- `07-ci-cd-and-delivery.md` — GitHub Actions, release, deployment, and supply-chain strategy.
- `08-docker-strategy.md` — whether Docker is justified and exactly what it contains.
- `09-responsive-and-platform-strategy.md` — mobile-first/desktop-first decision and browser capability policy.
- `10-repository-map.md` — proposed tree plus the responsibility of every important directory and file.
- `11-engineering-policies.md` — architecture, dependency, testing, security, performance, and documentation rules.
- `AGENTS.md` and `agent/` — execution contract for AI coding agents.
- `brand/` — actual SVG logo variants and favicon assets.
- `templates/` — starter GitHub Actions, environment, and container files.

## Non-negotiable global rules

1. Every core workflow must be completable without a paid API or paid UI kit.
2. Every project must have a reviewer-friendly live demo when a browser demo is meaningful.
3. A live demo may use fixture mode; full infrastructure remains reproducible locally.
4. Nuxt is used only when SSR, prerendering, SEO, content routing, or server capabilities are part of the product thesis.
5. Browser-only labs and editors default to Vue + Vite.
6. Docker is used only when it removes genuine multi-service setup risk; it is not a portfolio decoration.
7. All external providers sit behind ports/adapters and have a local or fixture implementation.
8. Each phase is a tagged, runnable vertical slice with documentation and tests.
9. AI agents must read `AGENTS.md`, the active phase file, and repository policies before modifying code.

## Recommended reading order

1. `01-PROJECT-ORDER.md`
2. `02-STACK-MATRIX.md`
3. `03-VERSION-AND-RELEASE-POLICY.md`
4. `04-DOCUMENTATION-SYSTEM.md`
5. `05-DESIGN-TOKEN-STANDARD.md`
6. `06-ARCHITECTURE-DECISION-GUIDE.md`
7. `08-BRAND-SYSTEM-STANDARD.md`
8. `09-LOCAL-LIVE-DEMO-STANDARD.md`
9. `10-CI-CD-DOCKER-STANDARD.md`
10. `11-AI-AGENT-EXECUTION-STANDARD.md`
11. Open project `01` and execute only its active phase.
