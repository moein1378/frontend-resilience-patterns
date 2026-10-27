# Agent Constraints — Frontend Resilience Patterns

- Follow the dependency direction in `10-repository-map.md`.
- Do not import provider SDKs into domain modules.
- Do not add a dependency without documenting purpose, version policy, and replacement path.
- Maintain local/fixture completion.
- Use semantic design tokens; no unexplained visual constants.
- Preserve mobile/desktop strategy: Desktop-first engineering console; tablet supports stacked telemetry; phone supports read-only scenario replay.
- Keep generated files reproducible.
- Stop and create an ADR when a requirement conflicts with the blueprint.
