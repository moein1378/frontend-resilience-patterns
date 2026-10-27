import { describe, expect, it } from 'vitest';
import { validateImport } from './check-architecture.mjs';

describe('architecture boundary validation', () => {
  it('allows a scenario package to import the contracts public entry point', () => {
    expect(validateImport('packages/failure-scenarios/src/fixture.ts', '@frp/contracts')).toEqual({ ok: true });
  });

  it('rejects a domain package import from a framework', () => {
    expect(validateImport('packages/resilience-core/src/policy.ts', 'vue')).toEqual({
      ok: false,
      reason: 'Domain packages cannot import framework or app modules: vue',
    });
  });

  it('rejects cross-package deep imports', () => {
    expect(validateImport('packages/telemetry/src/metrics.ts', '@frp/contracts/src/internal.ts')).toEqual({
      ok: false,
      reason: 'Cross-package imports must use the public entry point: @frp/contracts/src/internal.ts',
    });
  });
});
