# Testing strategy

Pure algorithms use a fake clock and seeded random-number generator. Contract tests verify browser and Hono adapter parity, invariant tests cover unsafe mutations and cancellation, and Playwright covers user-visible workflows.
