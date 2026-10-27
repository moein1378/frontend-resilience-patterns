import { AttemptRequestSchema, type AttemptRequest, type AttemptResponse } from '@frp/contracts';
import { builtInScenarios, faultFor, findScenario } from '@frp/failure-scenarios';
import { SyntheticTransportError, SystemClock, type Clock } from '@frp/resilience-core';
import { Hono } from 'hono';

const maxBodyBytes = 32 * 1024;
const allowedOrigins = new Set(['http://localhost:9000', 'http://127.0.0.1:9000']);

function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  });
}

function problem(code: string, message: string, status: number): Response {
  return json({ code, message, retryable: false }, status);
}

export function createHonoApp(options: { clock?: Clock } = {}) {
  const app = new Hono();
  const clock = options.clock ?? new SystemClock();

  async function executeLocal(input: AttemptRequest, signal: AbortSignal): Promise<AttemptResponse> {
    const scenario = findScenario(input.scenarioId)!;
    const decision = faultFor({
      scenarioSeed: input.seed,
      scenarioId: input.scenarioId,
      operationId: input.operationId,
      operationOrdinal: input.operationOrdinal,
      attemptIndex: input.attemptIndex,
      endpoint: input.endpoint,
      profile: scenario.faultProfile,
    });
    await clock.sleep(decision.latencyMs, signal);
    if (decision.kind === 'disconnect') throw new SyntheticTransportError('network-error', 'Synthetic connection drop');
    const headers: Record<string, string> = {};
    if (decision.retryAfterSeconds !== undefined) headers['retry-after'] = String(decision.retryAfterSeconds);
    if (decision.kind === 'malformed') {
      return { statusCode: 200, headers, body: { schemaVersion: 1, operationId: input.operationId, malformed: true } };
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
        source: 'local',
      },
    };
  }

  app.use('*', async (context, next) => {
    await next();
    const origin = context.req.header('origin');
    if (origin && allowedOrigins.has(origin)) {
      context.header('access-control-allow-origin', origin);
      context.header('vary', 'Origin');
    }
  });

  app.get('/healthz', () => json({ status: 'ok', service: 'frontend-resilience-chaos-api', schemaVersion: 1 }));
  app.get('/v1/scenarios', () =>
    json(
      builtInScenarios.map(({ id, title, category, workloadId }) => ({
        schemaVersion: 1,
        id,
        title,
        category,
        workloadId,
      })),
    ),
  );

  app.post('/v1/execute', async (context) => {
    if (!context.req.header('content-type')?.toLowerCase().startsWith('application/json')) {
      return problem('UNSUPPORTED_MEDIA_TYPE', 'Content-Type must be application/json', 415);
    }
    const declaredLength = Number(context.req.header('content-length') ?? 0);
    if (Number.isFinite(declaredLength) && declaredLength > maxBodyBytes) {
      return problem('PAYLOAD_TOO_LARGE', 'Request body exceeds 32 KiB', 413);
    }
    const text = await context.req.text();
    if (new TextEncoder().encode(text).byteLength > maxBodyBytes) {
      return problem('PAYLOAD_TOO_LARGE', 'Request body exceeds 32 KiB', 413);
    }
    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      return problem('INVALID_JSON', 'Request body is not valid JSON', 400);
    }
    if (typeof raw === 'object' && raw !== null && 'schemaVersion' in raw && raw.schemaVersion !== 1) {
      return problem('UNSUPPORTED_SCHEMA_VERSION', 'Only schemaVersion 1 is supported', 422);
    }
    const parsed = AttemptRequestSchema.safeParse(raw);
    if (!parsed.success) return problem('INVALID_REQUEST', 'Request does not match the bounded attempt contract', 400);
    if (!findScenario(parsed.data.scenarioId)) return problem('UNKNOWN_SCENARIO', 'Scenario is not available', 404);
    try {
      const response = await executeLocal(parsed.data, context.req.raw.signal);
      return json(response.body, response.statusCode, response.headers);
    } catch (error) {
      if (error instanceof SyntheticTransportError && error.outcome === 'network-error') {
        return json({ code: 'SYNTHETIC_DISCONNECT', message: error.message, retryable: true }, 503);
      }
      if (context.req.raw.signal.aborted) return problem('REQUEST_ABORTED', 'Request was aborted', 499);
      return problem('INTERNAL_ERROR', 'Synthetic execution failed safely', 500);
    }
  });

  return app;
}
