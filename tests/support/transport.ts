import { SuccessBodySchema, type AttemptRequest } from "@frp/contracts";
import {
  SyntheticTransportError,
  type Clock,
  type Transport,
} from "@frp/resilience-core";

export class ImmediateClock implements Clock {
  elapsed = 0;
  now = () => this.elapsed;
  async sleep(delayMs: number, signal?: AbortSignal) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    this.elapsed += delayMs;
  }
}

export async function semanticOutcome(
  transport: Transport,
  request: AttemptRequest,
) {
  try {
    const response = await transport.execute(
      request,
      new AbortController().signal,
    );
    const parsed = SuccessBodySchema.safeParse(response.body);
    return {
      kind:
        response.statusCode >= 400
          ? "http-error"
          : parsed.success
            ? "success"
            : "malformed",
      statusCode: response.statusCode,
      retryable: response.statusCode === 429 || response.statusCode >= 500,
      syntheticId: parsed.success ? parsed.data.syntheticData.itemId : null,
    };
  } catch (error) {
    if (error instanceof SyntheticTransportError) {
      return {
        kind: "disconnect",
        statusCode: 0,
        retryable: true,
        syntheticId: null,
      };
    }
    throw error;
  }
}
