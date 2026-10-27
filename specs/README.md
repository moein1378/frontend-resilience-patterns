# Proposed machine-readable fixture contracts (not runtime code)

- `scenarios.json`: eight representative deterministic fault conditions from the original v3 scope.
- `workloads.json`: read, burst, unsafe mutation and polling workloads with stable logical IDs.
- `experiment.schema.json`: proposed export snapshot JSON Schema v1. Runtime Zod contract must enforce the same semantics and tighter bounds.
- `metrics-test-vectors.json`: expected percentile/denominator sanity examples.

These are **proposed fixture inputs**, not evidence of a working implementation. Codex must validate schema values, normalize sequence interpretation per attempt, define and golden-test hash behavior, implement browser/Hono parity, and document any schema change in ADR/release notes.

`statusSequence` is indexed by attempt index (use last value or documented wrap behavior after list end; suggested **last value**). `disconnectAttempts` and `malformedAttempts` take precedence over HTTP status for the listed attempt. A particular operation's fault decision is keyed by operationId/attemptIndex and scenario seed to prevent cross-operation drift. `latencySequenceMs` also indexes attempts (suggested last value after array end). Explicitly test this precedence.
