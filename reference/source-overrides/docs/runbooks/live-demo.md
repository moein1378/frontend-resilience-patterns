# Frontend Resilience Patterns — Live Demo Runbook

Deployment strategy: GitHub Pages fixture demo. Optional Cloudflare Worker chaos endpoint is documented but never required.

- Build with `pnpm build:demo`.
- Verify no secret-bearing variable is bundled.
- Run the production artifact locally before deployment.
- Deploy only after CI succeeds.
- Run smoke tests for the README-linked route and first meaningful workflow.
- Record demo mode and known limitations in README.
