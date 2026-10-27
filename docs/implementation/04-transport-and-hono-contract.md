# Transport/chaos API contract and runtime parity

## Required adapters

1. **Browser fixture adapter**: default, no fetch to localhost, deterministic seeded evaluator, virtual/injected time. Works offline after assets load and on GitHub Pages.
2. **Node Hono reference adapter**: separately running `apps/chaos-api`, directly runnable without Docker. Uses exactly the shared validation and fault evaluator package.
3. **Hosted Worker (optional, Phase 06)**: must implement the same typed port, not bypass it.

## Proposed API, version 1

| Endpoint | Method | Purpose | Safety |
|---|---|---|---|
| `/healthz` | GET | Health/status, server version; never network probe public providers | bounded response |
| `/v1/execute` | POST | Execute one **synthetic logical attempt envelope** (even if its simulated method is GET); return injected HTTP response or connection failure | strict schema + max size + timeout |
| `/v1/scenarios` | GET | List built-in safe scenario metadata | no user data |

A POST transport envelope **does not** reclassify its `logicalMethod` into a mutation; logical semantic method/operation classification is explicit in request body. Do not implement a real financial/identity mutation or leak to real APIs.

### Request example

```json
{
  "schemaVersion": 1,
  "scenarioId": "intermittent-503",
  "seed": "resilience-v1",
  "runId": "run-demo-a",
  "operationId": "read-001",
  "attemptIndex": 0,
  "endpoint": "catalog",
  "classification": "read",
  "logicalMethod": "GET"
}
```

**Validation:** Nonempty bounded IDs, `schemaVersion = 1`, attemptIndex integer `0..4`, allowed endpoint enum, fixed operation classification, bounded JSON body (< 32KiB suggested) and finite delay caps. Reject invalid requests `400` with stable problem schema. Limit JSON content type. Reject unsupported schema version `422` with `code: UNSUPPORTED_SCHEMA_VERSION`. Use Zod (source dependency); avoid duplicating schemas.

### Response and failure expression

- Normal success: `200` with `{schemaVersion:1, operationId, attemptIndex, syntheticData, generatedAtOffsetMs, source:'fixture'|'local'}`.
- Injected `429` or `5xx`: appropriate status, safe stable `{code, message, retryable}`; `Retry-After` numeric seconds when configured. Do not return `200` wrapping a simulated failure unless specifically experimenting with invalid payloads.
- Network drop in browser fixture: reject with typed `SyntheticNetworkError`; in Hono Node simulate early disconnect/aborted response under controlled tests; document any runtime inability to reproduce exact socket behavior. Contract parity compares semantic outcomes, not raw socket exception names.
- Latency timeout: fixture clock controls delay; Hono real wait can be bounded/cancelled. Any AbortSignal must stop pending wait; the server may observe disconnect only eventually.
- Malformed payload: expose an explicitly invalid JSON/body-schema case; the client must validate and display `invalid-payload`, not silently coerce it.

## Fault decision function

```ts
function faultFor(input: {
  scenarioSeed: string; scenarioId: string; operationId: string;
  attemptIndex: number; endpoint: string; profile: FaultProfile;
}): FaultDecision;
```

Use deterministic hash/schedule described in `02-scenarios-and-fixtures.md`. Browser and Hono share this package. Keep fault decision (pure) separate from fault execution (async clock/network adapter).

## Transport policy

- The app does not send real authentication headers/credentials anywhere.
- Explicit mode switch `Fixture | Local`; public build locks fixture unless user deliberately configures supported adapter and acknowledges mode change.
- Use local CORS origin allowlist; never `*` with credentials or broad dangerous methods.
- Do not trust client attempts to determine actual privileged server actions; all activity is synthetic and resource capped.
- Hono API errors use safe messages, no stack traces in browser; logs redact arbitrary user payloads.

## Adapter contract tests

For every scenario in `specs/scenarios.json`, send the same validated input to both adapters. Assert fault class, retryable flag, status when applicable, attempt indices, data shape and stable synthetic identity. Use fake clocks for core decisions and tolerant timing bounds for live Hono integration; tests never depend on Cloudflare Worker or external Internet.
