import type { AttemptResponse } from '@frp/contracts';
import { faultFor, findScenario } from '@frp/failure-scenarios';
import { SyntheticTransportError, type Clock, type Transport } from '@frp/resilience-core';

export function createFixtureTransport(options: {
  clock: Clock;
  source?: 'fixture' | 'local';
}): Transport {
  const source = options.source ?? 'fixture';
  return {
    async execute(input, signal): Promise<AttemptResponse> {
      const scenario = findScenario(input.scenarioId);
      if (!scenario)
        throw new SyntheticTransportError(
          'network-error',
          `Unknown synthetic scenario: ${input.scenarioId}`,
        );
      const decision = faultFor({
        scenarioSeed: input.seed,
        scenarioId: input.scenarioId,
        operationId: input.operationId,
        operationOrdinal: input.operationOrdinal,
        attemptIndex: input.attemptIndex,
        endpoint: input.endpoint,
        profile: scenario.faultProfile,
      });
      await options.clock.sleep(decision.latencyMs, signal);
      if (decision.kind === 'disconnect') {
        throw new SyntheticTransportError('network-error', 'Synthetic connection drop');
      }
      const headers: Record<string, string> = { 'content-type': 'application/json' };
      if (decision.retryAfterSeconds !== undefined)
        headers['retry-after'] = String(decision.retryAfterSeconds);
      if (decision.kind === 'malformed') {
        return {
          statusCode: 200,
          headers,
          body: { schemaVersion: 1, operationId: input.operationId, malformed: true },
        };
      }
      if (decision.kind === 'http-error') {
        return {
          statusCode: decision.statusCode,
          headers,
          body: {
            code: `SYNTHETIC_${decision.statusCode}`,
            message: `Injected HTTP ${decision.statusCode}`,
            retryable: decision.retryable,
          },
        };
      }
      return {
        statusCode: 200,
        headers,
        body: {
          schemaVersion: 1,
          operationId: input.operationId,
          attemptIndex: input.attemptIndex,
          syntheticData: {
            itemId: decision.syntheticId,
            label: `Synthetic catalog item ${input.operationOrdinal + 1}`,
          },
          generatedAtOffsetMs: decision.latencyMs,
          source,
        },
      };
    },
  };
}
