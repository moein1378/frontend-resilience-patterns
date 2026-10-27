# Toolchain Lock — Frontend Resilience Patterns

Resolve exact versions when implementation begins.

- Node.js: 24 LTS
- pnpm: set through the exact `packageManager` field
- TypeScript: latest stable compatible with the locked stack
- Primary stack: Quasar CLI with Vite in SPA mode + Vue 3 + TypeScript + SCSS semantic tokens; Hono chaos fixture

Record exact versions, checksums for binary/model assets, generated-client schema versions, and the date verified.
