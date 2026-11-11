import {
  TraceEventSchema,
  type TraceEvent,
  type TraceEventDraft,
} from "@frp/contracts";

export interface TelemetryCollector {
  emit(event: TraceEventDraft): TraceEvent;
  events(): readonly TraceEvent[];
  truncatedCount(): number;
  clear(): void;
}

export function createTelemetryCollector(
  maxEvents = 20_000,
): TelemetryCollector {
  if (!Number.isInteger(maxEvents) || maxEvents < 1 || maxEvents > 20_000) {
    throw new RangeError("maxEvents must be an integer between 1 and 20000");
  }
  let sequence = 0;
  let truncated = 0;
  const stored: TraceEvent[] = [];

  return {
    emit(draft) {
      const event = Object.freeze(
        TraceEventSchema.parse({ ...draft, sequence }),
      );
      sequence += 1;
      if (stored.length < maxEvents) stored.push(event);
      else truncated += 1;
      return event;
    },
    events: () => Object.freeze([...stored]),
    truncatedCount: () => truncated,
    clear() {
      stored.length = 0;
      sequence = 0;
      truncated = 0;
    },
  };
}
