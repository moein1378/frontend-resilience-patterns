# Module boundaries

`apps/lab` is the Quasar composition root and `apps/chaos-api` is the Hono adapter. `contracts` owns schemas, `failure-scenarios` owns deterministic faults, `resilience-core` owns pure policies and ports, and `telemetry` owns event projections. CI rejects cross-package deep imports and framework imports in pure packages.
