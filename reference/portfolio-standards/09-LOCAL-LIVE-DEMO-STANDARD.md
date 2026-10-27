# Local and Live Demo Standard

Every project declares four possible execution modes.

## Modes

1. **Fixture mode** — no backend, deterministic repository-owned data, suitable for GitHub Pages.
2. **Primary local mode** — shortest path to the core engineering thesis.
3. **Full-local mode** — all optional services and adapters, using direct Node/CLI commands and Docker only when useful.
4. **Hosted adapter mode** — optional provider deployment that never becomes the sole completion path.

## Live demo requirements

- A reviewer reaches meaningful evidence within two interactions.
- The demo contains a visible `Demo mode` label when data or services are simulated.
- Fixture data uses stable IDs and timestamps.
- Browser capability failures have sample-mode fallbacks.
- Public demos contain no secret-bearing environment variables.
- A demo deployment occurs only after CI succeeds.

## Hosting defaults

- Static Vite/VitePress/Storybook/Quasar fixture demos: GitHub Pages through GitHub Actions.
- Nuxt static output: GitHub Pages or Cloudflare Pages.
- Telegram Worker/D1 project: Cloudflare Workers/Pages, with Wrangler local parity.
- npm packages: trusted publishing from GitHub Actions with provenance.
- Multi-service applications: public fixture frontend plus reproducible full-local Docker Compose.
