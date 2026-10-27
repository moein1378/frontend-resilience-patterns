# Version and Release Policy

## Verified baseline date

**2026-08-02**

## Baselines

| Tool/framework | Baseline |
| --- | --- |
| Node.js | 24 LTS |
| Vue | 3.x |
| Nuxt | 4.x |
| Nuxt UI | 4.x |
| PrimeVue | 5.x community components |
| Quasar | 2.23.x; @quasar/app-vite 3.x |
| Tailwind CSS | 4.x |
| Vite | 8.1.x |
| Vitest | 5.x |
| XState | 5.x |
| GraphQL Yoga | 5.x |

## Exact-version procedure

Blueprints intentionally lock majors and architecture, while the exact patch is resolved when a repository is scaffolded:

1. Install Node.js 24 LTS.
2. Resolve the latest compatible patch within the listed major.
3. Run the framework's official scaffold/upgrade checks.
4. Commit `.nvmrc`, `engines`, `packageManager`, and the lockfile.
5. Write `docs/toolchain.lock.md` with exact versions and scaffold date.
6. Add Renovate with delayed updates and grouped non-breaking dependency PRs.

This prevents the roadmap from becoming unusable when a patch changes while still preventing unplanned framework-major drift.

## Repository versions

- `0.1.0`–`0.5.0`: ordered vertical slices.
- `0.9.0`: release candidate and feature freeze.
- `1.0.0`: stable public portfolio release.
- Packages use semantic versioning and Changesets.
- Apps/labs use semantic versioned GitHub releases even when they are not npm packages.
