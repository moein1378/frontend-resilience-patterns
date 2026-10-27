# System context (planned implementation)

```mermaid
flowchart LR
  Reviewer[Portfolio reviewer] --> SPA[Quasar Vue SPA]
  SPA --> Browser[Browser deterministic fixture adapter]
  SPA --> Local[Optional local Hono Node API]
  Browser --> Shared[Shared failure scenario contracts]
  Local --> Shared
  SPA --> Telemetry[Run-scoped telemetry]
  Telemetry --> UI[Accessible timeline and metrics]
```

The public Pages site does not require Local. See [`docs/implementation/01-architecture-and-layout.md`](../implementation/01-architecture-and-layout.md) for the proposed dependency DAG. This diagram is architectural intent, not a claim of implemented code.
