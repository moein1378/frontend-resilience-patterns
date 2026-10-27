# Prerequisites, environment, first-run contract

## Required local tools

| Requirement | Why | Verification |
|---|---|---|
| Node.js **24 LTS** | v3 source toolchain baseline | `node -v` |
| Corepack or an equivalent validated pnpm activation route | Exact package-manager version | `corepack --version`; if unavailable, document supported pnpm install route |
| pnpm **exact version pinned during scaffold** | Deterministic workspace/lockfile | `pnpm -v`; `package.json#packageManager` |
| Git + GitHub account only for publishing | Source control, optional public demo | `git --version`, `gh auth status` when publishing |
| Modern Chromium; Playwright-managed browser | E2E | `pnpm exec playwright --version` after install |
| Docker **optional** | Only full-local Hono alternative; no requirement for fixture | `docker version` if used |
| VS Code / WebStorm / Codex in Linux filesystem | Developer workflow | `pwd`, `which node`, `which pnpm` |

**WSL rule:** Keep repository under `/home/<user>/...` (e.g. `/home/moein/code/projects/FRONT_END/frontend-resilience-patterns`) rather than `/mnt/c/...`, and use the WSL Node interpreter in the IDE. Verify commands run inside WSL, not a Windows Node runtime. Official Quasar guidance notes slower builds/HMR issues on Windows-mounted directories.

## Initial commands and order

```bash
# In WSL Ubuntu
node -v
corepack --version
corepack enable       # where this Node/Corepack installation supports it
pnpm --version
unzip Frontend-Resilience-Patterns-Codex-Handoff.zip
cd Frontend-Resilience-Patterns-Codex-Handoff
# Start Codex in THIS directory and supply CODEX-START.md.
# The following commands become available AFTER Codex scaffolds packages:
pnpm install --frozen-lockfile
pnpm seed
pnpm dev             # browser fixture mode: no API required
pnpm dev:all         # Quasar SPA + Hono Node API
pnpm verify
```

If `corepack` is absent with your Node distribution, do not assume the command works; use a documented, compatible pnpm activation procedure and pin the tool. Initial scaffold/install cannot be `--frozen-lockfile` **until** Codex generates the first lockfile; first solve compatible versions, commit lockfile, then use frozen installs in CI.

## Toolchain pinning at kickoff

Source documents refer to `quasar` 2.x, `@quasar/app-vite` 3.x, TypeScript 5.x, Hono, Vitest, Playwright, fast-check and Zod. These are **policy ranges, not installed packages**. Codex must check mutually compatible versions at implementation time, use the official Quasar CLI scaffold, record exact versions/date in `docs/toolchain.lock.md`, and commit a real lockfile. No exact pnpm/package version is invented in this handoff.

Official guidance:
- https://quasar.dev/quasar-cli-vite/creating-a-quasar-app-vite-project-folder/
- https://quasar.dev/quasar-cli-vite/handling-vite/
- https://hono.dev/docs/getting-started/nodejs
- https://pnpm.io/workspaces
- https://playwright.dev/docs/intro

## Mode/runtime matrix

| Mode | Command | Needs API | Seed behavior | Publishable |
|---|---|---:|---|---|
| Fixture/dev | `pnpm dev` | No | Deterministic local simulator | Yes, using `build:demo` |
| Full-local | `pnpm dev:all` | Yes, Hono local | Same deterministic profiles/contract | No cloud account |
| CI | `pnpm verify` | No hosted dependency | Controlled fake-clock/tests | Yes |
| Hosted optional | Later Worker | Optional | Explicit Connected mode | Optional only |

## Ports and environment

- Quasar dev server can use a documented free port (recommend `9000`, verify against actual scaffold configuration).
- Hono API default `3001`, supports `/healthz` and documented scenario execution API.
- `VITE_CHAOS_API_URL` optional and **never secret**, used only when Connected/Full-local chosen.
- `CHAOS_SEED=resilience-v1` server-side default.
- Provide `.env.example`, ignore `.env.local`, validate user-selected URLs and use fail-safe adapter selection; public demo must not probe localhost silently.

## Acceptance of setup

- Clean machine with Node 24 and matching pnpm can install, seed, run fixture, and verify without Docker/paid services.
- Full-local Hono is runnable directly on Node; Docker is optional.
- Reproduction instructions, errors and troubleshooting belong in `docs/runbooks/local-development.md` once implemented.
