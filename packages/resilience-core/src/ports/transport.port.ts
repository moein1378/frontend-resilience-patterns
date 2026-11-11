import type {
  AttemptRequest,
  AttemptResponse,
  TraceEventDraft,
} from "@frp/contracts";

export interface Transport {
  execute(input: AttemptRequest, signal: AbortSignal): Promise<AttemptResponse>;
}

export interface TelemetrySink {
  emit(event: TraceEventDraft): unknown;
}

export class SyntheticTransportError extends Error {
  constructor(
    readonly outcome: "network-error" | "timeout",
    message: string,
  ) {
    super(message);
    this.name = "SyntheticTransportError";
  }
}
