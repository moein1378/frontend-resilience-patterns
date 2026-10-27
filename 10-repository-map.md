# Frontend Resilience Patterns — Repository Map and Ownership

## Authoritative tree

```text
.github/
  workflows/
apps/
  lab/
  chaos-api/
packages/
  resilience-core/
  failure-scenarios/
  telemetry/
  contracts/
brand/
docs/
  adr/
  architecture/
  runbooks/
  decisions/
phases/
agent/
templates/
scripts/
tests/
AGENTS.md
README.md
package.json
pnpm-workspace.yaml
pnpm-lock.yaml
.nvmrc
.env.example
```

## Directory and file responsibilities

| Path | Responsibility |
|---|---|
| `.github/workflows` | CI, deployment, release, security, and optional container automation. |
| `brand` | Generated logo variants, favicon assets, lockup, preview, and brand usage files. |
| `docs/adr` | Accepted architecture decision records; changes are append-only. |
| `docs/architecture` | Current diagrams, boundaries, data flow, and runtime topology. |
| `docs/runbooks` | Local startup, reset, release, rollback, incident, and provider instructions. |
| `phases` | One authoritative Markdown file per release milestone. |
| `agent` | Task brief, constraints, acceptance checklist, and handoff records for AI agents. |
| `templates` | Copyable workflows, environment files, and optional container scaffolding. |
| `scripts` | Deterministic fetch, checksum, seed, reset, code generation, and verification scripts. |
| `tests` | Cross-package integration and end-to-end suites; unit tests stay near source. |
| `AGENTS.md` | Mandatory operating contract for AI coding agents. |
| `.env.example` | Names and safe example values only; never real credentials. |
| `pnpm-lock.yaml` | Committed deterministic dependency resolution; never hand-edited. |
| `apps/lab` | Runnable application/runtime surface: lab. It may compose packages but may not own reusable domain rules. |
| `apps/chaos-api` | Runnable application/runtime surface: chaos-api. It may compose packages but may not own reusable domain rules. |
| `packages/resilience-core` | Owned module/package for resilience core. It exposes a narrow public API and declares allowed dependencies. |
| `packages/failure-scenarios` | Owned module/package for failure scenarios. It exposes a narrow public API and declares allowed dependencies. |
| `packages/telemetry` | Owned module/package for telemetry. It exposes a narrow public API and declares allowed dependencies. |
| `packages/contracts` | Owned module/package for contracts. It exposes a narrow public API and declares allowed dependencies. |

## Dependency direction

1. Application shells may depend on domain/application packages.
2. Domain packages never import UI frameworks, provider SDKs, or application routes.
3. Provider code implements owned ports inside adapter packages.
4. Shared contracts contain schemas/types, not business orchestration.
5. Cross-package imports use public entry points; deep imports are blocked.
6. No circular package dependency is accepted.

## Project modules

- `circuit breaker` — owned capability.
- `retry policy` — owned capability.
- `jitter strategies` — owned capability.
- `timeout budget` — owned capability.
- `bulkhead` — owned capability.
- `rate limiter` — owned capability.
- `fallback policy` — owned capability.
- `health metrics` — owned capability.

## User-facing surfaces

- Pattern Catalog
- Circuit Breaker Console
- Retry and Jitter Lab
- Bulkhead and Load-shedding Lab
- Telemetry Dashboard
- Failure Timeline

## File placement policy

- Keep unit tests next to source when they test one module.
- Keep cross-module integration tests under `tests/integration`.
- Keep Playwright tests under `tests/e2e`.
- Generated code lives under a clearly named `generated/` directory and is rebuilt by scripts.
- Do not create generic `utils/`, `helpers/`, or `common/` dumping grounds; name packages by owned capability.
- A file exceeding one responsibility is split by behavior, not by arbitrary line count.


## Internal application structure

```text
apps/web/
├── src/
│   ├── boot/               # Framework/plugin initialization and adapter registration.
│   ├── layouts/            # Application shells; no domain rules.
│   ├── pages/              # Route composition and view-model wiring.
│   ├── modules/            # Feature modules owning UI/application orchestration.
│   ├── router/             # Route declarations and guards.
│   ├── css/                # Quasar variables, semantic tokens, and global layers.
│   └── App.vue             # Root shell only.
├── src-pwa/                # Added only when the PWA phase activates it.
├── quasar.config.ts        # Single build-mode and plugin authority.
└── index.html              # Minimal document shell and metadata hooks.
```

## Internal package structure

```text
packages/<capability>/
├── src/
│   ├── domain/             # Pure entities, values, invariants, and policy interfaces.
│   ├── application/        # Use cases and orchestration over ports.
│   ├── adapters/           # Optional concrete platform/provider implementations.
│   ├── internal/           # Non-exported implementation details.
│   └── index.ts            # Explicit public API; no wildcard accidental exports.
├── tests/contract/         # Adapter/public-contract tests when needed.
├── package.json            # Exports, sideEffects, engines, files, and peer dependencies.
├── tsconfig.json           # Package project reference and strict settings.
└── vitest.config.ts        # Package-local test environment when different from root.
```

## File naming and responsibility map

| File/pattern | Purpose |
|---|---|
| `src/**/index.ts` | Deliberate public boundary; no business implementation is placed here. |
| `*.port.ts` | Framework/provider-neutral capability contract. |
| `*.adapter.ts` | Concrete implementation of a port. |
| `*.schema.ts` | Runtime validation and inferred TypeScript types. |
| `*.machine.ts` | XState workflow definition where a machine is justified. |
| `*.policy.ts` | Pure decision logic with no I/O. |
| `*.fixture.ts` | Deterministic synthetic data only. |
| `*.contract.test.ts` | Tests every adapter against the same behavioral contract. |
| `*.e2e.ts` | Reviewer-visible browser workflow; kept in the root E2E suite. |
| `generated/` | Script-generated artifacts; never manually edited. |

## Ownership policy

- Every directory has one named owner capability.
- An app is a composition root, not a second domain layer.
- A package may depend only on packages listed in the architecture graph/constraints.
- Provider adapters are replaceable and never imported from domain code.
- UI library components are wrapped only when the product needs an owned abstraction; avoid wrapper-for-wrapper's-sake.
