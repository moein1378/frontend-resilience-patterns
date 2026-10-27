# Architecture Decision Guide

## Purpose

This guide defines how repository topology, application architecture, UI composition, and documentation structure are selected across the portfolio. The goal is not to force one fashionable folder structure onto every project. The goal is to choose the smallest architecture that makes the engineering thesis visible and keeps the project finishable by one developer.

## Architecture vocabulary

### Standalone repository

A single deployable application or a single narrow package. Use it when there is one build target, one release unit, and no meaningful boundary that needs independent publishing or deployment.

### Package-based monorepo

A repository containing independently versioned packages and supporting applications. Each publishable package has its own `package.json`, public API, tests, and release boundary. This is the default for open-source package families.

Use it when:

- multiple packages must be published independently;
- the same core needs Vue, Nuxt, browser, or testing adapters;
- documentation and playground applications consume the packages exactly as external users do;
- package boundaries are part of the engineering thesis.

### Integrated monorepo

A repository containing deployable applications and internal libraries managed as one product. Internal libraries are not necessarily published. Boundaries exist to control coupling, ownership, build graphs, and test impact.

Use it when:

- a web app, API, worker, bot, or signaling service must evolve together;
- several deployable runtimes share schemas and domain contracts;
- atomic changes across frontend and backend are valuable;
- CI should run only affected projects.

### Hybrid monorepo

A repository combining independently publishable packages with integrated applications. Use this only for flagship projects where the product itself is also a proving ground for reusable packages.

Example:

```text
apps/
  web/
  docs/
  api/
packages/
  domain/
  runtime/
  vue/
  testing/
```

### Modular monolith

A single application deployment organized into explicit business modules. Modules communicate through public contracts rather than arbitrary imports. It is appropriate for portfolio apps because it demonstrates boundaries without introducing unnecessary microservices.

### Feature-Sliced Design

Feature-Sliced Design is used only inside product applications, not as the primary structure of libraries. The recommended subset is:

```text
app/
pages/
widgets/
features/
entities/
shared/
```

Not every layer is mandatory. Import direction is downward. Shared code must not know business concepts. Features represent meaningful user actions, not every composable or component.

### Ports and adapters

Domain logic depends on interfaces such as `EventStore`, `Transport`, `VisionRuntime`, or `PersistencePort`. Browser APIs, Supabase, Cloudflare, GraphQL, IndexedDB, WebSocket, and framework bindings implement those interfaces. This keeps the local reference implementation working even if a cloud provider or library changes.

### Atomic Design

Atomic Design is a UI-system mental model, not a universal application folder architecture. It is used for Pavo's component taxonomy, documentation, and composition language. Other projects use domain or feature names instead of forcing every component into `atoms`, `molecules`, and `organisms` directories.

### Flat package structure

A narrow package should remain flat until independent subdomains appear. Deep folders are not evidence of seniority. A package such as a semaphore implementation can use:

```text
src/
  semaphore.ts
  queue.ts
  errors.ts
  types.ts
  index.ts
```

### Scenario-first structure

Concept labs are organized by scenario because the visitor must compare a broken implementation with a corrected implementation. The scenario is the unit of discovery, testing, and documentation.

```text
src/scenarios/search-race/
  broken/
  fixed/
  model/
  tests/
  README.md
```

## Portfolio-wide architecture rules

1. **Every backend-dependent project has a local reference backend.** A hosted service is an adapter, never the only way to run the project.
2. **Every project has one engineering thesis.** Secondary technologies may support it but may not compete with it.
3. **No speculative microservices.** Separate runtimes exist only when browser security, WebSocket coordination, bot validation, or compute isolation requires them.
4. **Public APIs are explicit.** Packages export through a single `index.ts` per package. Application slices expose a controlled public API.
5. **Browser-heavy work leaves the main thread.** Parsing, computer vision, graph layout, and expensive rendering use workers when measurement justifies it.
6. **Provider code is replaceable.** Hosted storage, realtime, RPC, or GraphQL clients live behind adapters.
7. **Architecture is enforced.** Nx tags, ESLint boundaries, package exports, and dependency-cruiser rules prevent accidental imports.
8. **Documentation is part of the implementation.** Architecture diagrams, state models, and failure behavior are release requirements.

## Tooling policy

### Monorepo tooling

- `pnpm workspaces` is the package and linking foundation.
- `Nx` is used for flagship or multi-runtime repositories where project graphs, dependency constraints, affected commands, and caching add real value.
- Small two-package repositories may use plain pnpm workspaces without Nx.

### Application architecture

- Nuxt applications use a Feature-Sliced-inspired structure inside `app/`.
- Framework-independent domain logic lives in workspace packages or `shared/lib` only when it is truly generic.
- Nuxt Layers are reserved for reusable Nuxt configuration or feature layers shared by multiple Nuxt applications. They are not used merely to create more folders.

### UI organization

- Product apps: domain/feature-first component organization.
- Design system: component-per-folder with an Atomic Design vocabulary in docs.
- Concept labs: scenario-first.
- Small libraries: flat, capability-first.

## Decision matrix

| Project condition | Recommended structure |
| --- | --- |
| One narrow framework-agnostic package | Standalone or small pnpm workspace |
| Core package plus Vue/Nuxt adapters | Package-based monorepo |
| Web app plus API/worker/bot | Integrated monorepo |
| Product plus publishable SDKs | Hybrid monorepo |
| Educational comparison of failures | Scenario-first standalone app |
| Large product UI | Modular monolith + FSD subset |
| Design system | Package-based monorepo + component-per-folder + Atomic Design docs |
| Heavy browser compute | App/package architecture plus dedicated worker boundary |

## Research basis

- Nx, “What is a Monorepo?”: https://nx.dev/docs/concepts/decisions/what-is-a-monorepo
- Nx architectural decisions: https://nx.dev/docs/concepts/decisions
- pnpm workspaces: https://pnpm.io/workspaces
- Feature-Sliced Design overview: https://feature-sliced.design/docs/get-started/overview
- Feature-Sliced Design layers: https://feature-sliced.design/docs/reference/layers
- Atomic Design by Brad Frost: https://atomicdesign.bradfrost.com/chapter-2/
- Nuxt Layers: https://nuxt.com/docs/4.x/getting-started/layers


## v2 enforcement

Each project blueprint now states its selected architecture and workspace shape. Do not switch between flat, modular monolith, package monorepo, integrated monorepo, or hybrid monorepo merely for variety; create an ADR showing the runtime or ownership pressure that requires the change.
