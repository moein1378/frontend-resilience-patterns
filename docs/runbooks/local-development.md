# Local development

Use the Node.js version in [`.nvmrc`](../../.nvmrc) and pnpm 11.22.0, as pinned in [`package.json`](../../package.json). Install the workspace dependencies from the committed lockfile:

```bash
pnpm install --frozen-lockfile
pnpm seed
pnpm dev
```

Open `http://localhost:9000/`. Fixture mode runs entirely in the browser. To exercise real HTTP requests against the local chaos API, use `pnpm dev:all` and select **Local API** in the lab. The API listens on port 3001 by default.

Run `pnpm verify` for formatting, lint, documentation fixtures, secret signatures, architecture boundaries, types, tests, browser journeys, and production builds. Install Chromium with `pnpm exec playwright install --with-deps chromium` before the first browser test run.

For the production demo build and GitHub Pages setup, see the [live demo runbook](live-demo.md).

## Browser verification

`pnpm test:e2e` starts an owned lab server on port 9010 and stops it afterward. Keep that port free. Tests use their own server so an existing development session on port 9000 cannot supply stale checker overlays or old code. Chromium and local-server permissions are required; sandboxed execution may need the normal permission override.
