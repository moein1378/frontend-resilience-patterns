import { ProblemBodySchema, type AttemptResponse } from '@frp/contracts';
import { SyntheticTransportError, type Transport } from '@frp/resilience-core';

const allowedHosts = new Set(['localhost', '127.0.0.1']);

export function createHttpTransport(options: { baseUrl: string; fetch?: typeof fetch }): Transport {
  const baseUrl = new URL(options.baseUrl);
  if (
    baseUrl.protocol !== 'http:' ||
    !allowedHosts.has(baseUrl.hostname) ||
    baseUrl.username ||
    baseUrl.password
  ) {
    throw new TypeError(
      'Local transport URL must be an unauthenticated http://localhost or http://127.0.0.1 URL',
    );
  }
  const fetcher = options.fetch ?? globalThis.fetch;
  return {
    async execute(input, signal): Promise<AttemptResponse> {
      const response = await fetcher(new URL('/v1/execute', baseUrl), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(input),
        signal,
      });
      const body: unknown = await response.json().catch(() => ({
        code: 'INVALID_JSON',
        message: 'Invalid JSON response',
        retryable: false,
      }));
      const problem = ProblemBodySchema.safeParse(body);
      if (problem.success && problem.data.code === 'SYNTHETIC_DISCONNECT') {
        throw new SyntheticTransportError('network-error', problem.data.message);
      }
      return {
        statusCode: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body,
      };
    },
  };
}
