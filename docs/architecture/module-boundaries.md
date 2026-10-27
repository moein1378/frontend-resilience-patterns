# Module boundaries (planned implementation)

See [`docs/implementation/01-architecture-and-layout.md`](../implementation/01-architecture-and-layout.md) and the source [`10-repository-map.md`](../../10-repository-map.md). `apps/lab` is a Quasar composition root, `apps/chaos-api` is a Hono adapter, `contracts` owns schemas, `failure-scenarios` owns deterministic faults, `resilience-core` owns pure policies/ports, `telemetry` owns event projections. Cross-package deep imports/framework import in pure packages must be rejected in CI.
