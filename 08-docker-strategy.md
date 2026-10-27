# Frontend Resilience Patterns — Docker Strategy

## Decision

Optional only for the full-local chaos API. The static fixture demo and direct Node Hono server remain first-class.

## Proposed container topology

- `web` is built as static assets when applicable and is not forced into a runtime container for the public demo.
- Each real server gets its own multi-stage Dockerfile.
- `compose.local.yml` wires only local services, named volumes, health checks, and deterministic seed commands.
- Source mounts are development-only; release images copy built artifacts.
- Services run as non-root users.
- Database or chain state has a documented reset command.

## Image publication

Publish to GHCR only if the repository contains a reusable server image. Browser-only artifacts deploy as static output.

## Mandatory anti-complexity rule

A Dockerfile may be added only when it starts a real runtime service, reproduces a native dependency, or materially simplifies a multi-service workflow. It may not be added solely as portfolio decoration.
