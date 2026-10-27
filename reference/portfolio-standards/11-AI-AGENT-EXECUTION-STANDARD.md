# AI Agent Execution Standard

Each project is structured so an AI coding agent can execute a phase without inventing architecture.

## Required reading order for an agent

1. `AGENTS.md`
2. `01-blueprint.md`
3. `10-repository-map.md`
4. `11-engineering-policies.md`
5. `04-dependencies-and-services.md`
6. The active file inside `phases/`
7. Relevant ADRs and current task brief

## Agent rules

- Work on one phase and one vertical slice at a time.
- Do not add a dependency without updating the dependency contract and recording why existing platform APIs are insufficient.
- Do not bypass domain ports from UI code.
- Do not silently change public contracts, design tokens, phase scope, or hosting strategy.
- A material architecture change requires an ADR.
- Update tests and documentation in the same change.
- Run `pnpm verify` before declaring a task complete.
- Report blocked requirements honestly; never replace them with fake data unless fixture mode is explicitly defined.
- Keep generated artifacts reproducible through scripts.
