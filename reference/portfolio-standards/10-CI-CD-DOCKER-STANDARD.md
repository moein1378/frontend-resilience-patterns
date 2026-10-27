# CI/CD and Docker Standard

## Mandatory pull-request pipeline

1. Frozen dependency install.
2. Formatting and lint checks.
3. Documentation lint and link checks.
4. Architecture/import-boundary checks.
5. Type checking.
6. Unit and integration tests.
7. Browser/E2E tests where relevant.
8. Production build.
9. Bundle or performance budget.
10. Secret scan, dependency review, and package-content inspection.

## Deployment concurrency

Deploy workflows use a concurrency group per environment so a newer deployment cancels an obsolete in-progress deployment. Production uses a protected GitHub Environment when secrets or provider credentials exist.

## Package release

Open-source packages use Changesets, npm trusted publishing, provenance, GitHub Release notes, and exact package-content verification. Long-lived npm tokens are not the default.

## Docker decision

Use Docker when the project has multiple local services, native service dependencies, or a reviewer benefits from one-command parity. Do not containerize a static browser-only lab merely to show Docker.

## Image strategy

- Multi-stage builds.
- Non-root runtime user.
- Read-only filesystem where practical.
- Health check for long-running services.
- Exact base-image major and digest recording at release time.
- GHCR image publication only for projects with a real server/runtime image.
