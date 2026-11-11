# Live demo

[**Open the demo →**](https://moein1378.github.io/frontend-resilience-patterns/) · [CI and deployment status](https://github.com/moein1378/frontend-resilience-patterns/actions/workflows/ci.yml)

The demo is a static Quasar/Vue application hosted on GitHub Pages. Browser fixtures power the experiments without an API server. Use **Fixture** mode online; **Local** mode requires running the Hono chaos API yourself.

## One-time GitHub setup

1. Push this project to its GitHub repository with `main` as the deployment branch.
2. In **Settings → Pages → Build and deployment**, set **Source** to **GitHub Actions**.
3. If the `github-pages` environment has deployment rules, allow the `main` branch. Leave required reviewers disabled for automatic deployment.
4. Push to `main`, or select **Actions → CI and demo deployment → Run workflow** on `main`.

See [GitHub's custom Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) for the repository settings and permission requirements. No personal access token or deployment secret is needed.

## Automatic deployment

The workflow in [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) runs verification on every push to `main` and every pull request. After verification succeeds on `main`, it builds the demo, uploads `apps/lab/dist/spa` as a Pages artifact, and deploys it. Pull requests only run verification.

The build takes its public asset path from GitHub Pages metadata, supporting both repository subpaths and custom domains. Hash routing allows pages such as `/#/retry-lab` to load directly without server rewrites.

The deployment job exposes the actual demo URL in the `github-pages` environment and the workflow run summary. Before publishing, it checks that the workflow commit is still the latest commit on `main`, so a slower older run cannot overwrite a newer demo. Superseded runs still complete verification but skip publication.

## Local production build

```bash
pnpm install --frozen-lockfile
pnpm build:demo
```

This builds the SPA with the default `/frontend-resilience-patterns/` asset path. To reproduce another Pages path, use `DEMO_BASE=/your-repository/ pnpm --filter @frp/lab build`; use `DEMO_BASE=/` for a site hosted at a domain root. Serve the output at the same path when previewing it.

## Smoke check after deployment

Open the deployed URL, run the baseline experiment in Fixture mode, and check that it completes with metrics and a timeline. Open **Retry and Jitter Lab**, run a comparison, and refresh that URL to confirm routing and assets load correctly. The online demo does not deploy the Hono API.

The demo URL becomes available after the first successful Pages deployment. A live deployment has not yet been verified from this checkout.
