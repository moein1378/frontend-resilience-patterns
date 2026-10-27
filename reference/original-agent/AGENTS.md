# AGENTS.md — Frontend Resilience Patterns

## Mission

Implement `frontend-resilience-patterns` as defined by the v3 blueprints. Do not redesign the product or substitute the stack without an accepted ADR.

## Required reading order

1. `01-blueprint.md`
2. `10-repository-map.md`
3. `11-engineering-policies.md`
4. `04-dependencies-and-services.md`
5. `03-design-tokens.md`
6. `05-brand-system.md`
7. The active file in `phases/`
8. `agent/TASK-BRIEF.md`

## Hard constraints

- Current phase only.
- Keep the primary workflow free of paid services.
- Preserve: Scenario-first Quasar SPA with pure policy modules and an optional local chaos API.
- Use: Quasar CLI with Vite in SPA mode + Vue 3 + TypeScript + SCSS semantic tokens; Hono chaos fixture
- Rendering decision: Client-rendered SPA. The purpose is runtime failure injection; SSR would increase infrastructure without improving the thesis.
- Do not add secrets to client environment variables.
- Do not introduce placeholder APIs or fake success states outside documented fixture mode.
- Do not redraw brand assets.
- Update tests and docs in the same change.

## Completion command

`pnpm verify`

A task is incomplete until verification passes and `agent/HANDOFF.md` records changed files, tests, decisions, limitations, and the next safe step.
