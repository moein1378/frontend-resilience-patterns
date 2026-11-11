import { z } from "zod";

const boundedId = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const boundedText = z.string().trim().min(1).max(160);
const uniqueIds = <T extends { id: string }>(items: T[]): boolean =>
  new Set(items.map(({ id }) => id)).size === items.length;

export const SchemaVersionSchema = z.literal(1);
export const EndpointSchema = z.enum(["catalog", "synthetic-mutation"]);
export const OperationClassificationSchema = z.enum([
  "read",
  "safe-mutation",
  "unsafe-mutation",
  "polling",
]);
export const LogicalMethodSchema = z.enum(["GET", "POST"]);
export const OutcomeSchema = z.enum([
  "success",
  "timeout",
  "abort",
  "network-error",
  "http-429",
  "http-5xx",
  "http-other",
  "invalid-payload",
  "rejected-by-policy",
  "stale-fallback",
]);

export const FaultProfileSchema = z
  .strictObject({
    mode: z.enum(["fixed", "sequence", "seeded-probability"]),
    latencyMs: z.number().int().min(0).max(10_000).optional(),
    latencySequenceMs: z
      .array(z.number().int().min(0).max(10_000))
      .min(1)
      .max(200)
      .optional(),
    statusSequence: z.array(z.number().int().min(100).max(599)).min(1).max(200),
    disconnectAttempts: z.array(z.number().int().min(0).max(4)).max(5),
    malformedAttempts: z.array(z.number().int().min(0).max(4)).max(5),
    retryAfterSeconds: z.number().int().min(0).max(60).optional(),
    probability: z.number().min(0).max(1).optional(),
  })
  .superRefine((profile, context) => {
    if (
      profile.mode === "seeded-probability" &&
      profile.probability === undefined
    ) {
      context.addIssue({
        code: "custom",
        path: ["probability"],
        message: "Seeded probability mode requires probability",
      });
    }
    if (
      profile.mode === "sequence" &&
      profile.latencyMs === undefined &&
      profile.latencySequenceMs === undefined
    ) {
      context.addIssue({
        code: "custom",
        path: ["latencyMs"],
        message: "Sequence mode requires a latency",
      });
    }
  });

export const ScenarioSchema = z.strictObject({
  schemaVersion: SchemaVersionSchema,
  id: boundedId.max(80),
  title: boundedText,
  seed: z.string().trim().min(1).max(120),
  category: z.enum([
    "healthy",
    "latency",
    "status",
    "disconnect",
    "malformed",
    "burst",
    "mutation",
  ]),
  workloadId: boundedId.max(80),
  faultProfile: FaultProfileSchema,
  notes: z.string().trim().max(500),
});

export const ScenarioCollectionSchema = z
  .array(ScenarioSchema)
  .min(1)
  .max(100)
  .refine(uniqueIds, { message: "Scenario ids must be unique" });

export const WorkloadOperationSchema = z.strictObject({
  id: boundedId,
  arrivalAtMs: z.number().int().min(0).max(60_000),
  endpoint: EndpointSchema,
});

export const WorkloadSchema = z
  .strictObject({
    schemaVersion: SchemaVersionSchema,
    id: boundedId.max(80),
    title: boundedText,
    classification: OperationClassificationSchema,
    logicalMethod: LogicalMethodSchema,
    operations: z.array(WorkloadOperationSchema).min(1).max(200),
  })
  .refine(({ operations }) => uniqueIds(operations), {
    path: ["operations"],
    message: "Operation ids must be unique",
  });

export const WorkloadCollectionSchema = z
  .array(WorkloadSchema)
  .min(1)
  .max(100)
  .refine(uniqueIds, { message: "Workload ids must be unique" });

export const AttemptRequestSchema = z.strictObject({
  schemaVersion: SchemaVersionSchema,
  scenarioId: boundedId.max(80),
  seed: z.string().trim().min(1).max(120),
  runId: boundedId,
  operationId: boundedId,
  operationOrdinal: z.number().int().min(0).max(199),
  attemptIndex: z.number().int().min(0).max(4),
  endpoint: EndpointSchema,
  classification: OperationClassificationSchema,
  logicalMethod: LogicalMethodSchema,
});

export const SyntheticDataSchema = z.strictObject({
  itemId: boundedId,
  label: z.string().trim().min(1).max(120),
});

export const SuccessBodySchema = z.strictObject({
  schemaVersion: SchemaVersionSchema,
  operationId: boundedId,
  attemptIndex: z.number().int().min(0).max(4),
  syntheticData: SyntheticDataSchema,
  generatedAtOffsetMs: z.number().int().min(0).max(60_000),
  source: z.enum(["fixture", "local"]),
});

export const ProblemBodySchema = z.strictObject({
  code: z.string().trim().min(1).max(80),
  message: z.string().trim().min(1).max(200),
  retryable: z.boolean(),
});

export const AttemptResponseSchema = z.strictObject({
  statusCode: z.number().int().min(100).max(599),
  body: z.unknown(),
  headers: z.record(z.string(), z.string()),
});

export const TraceEventKindSchema = z.enum([
  "retry-scheduled",
  "timeout-deadline",
  "run-started",
  "logical-operation-started",
  "attempt-started",
  "attempt-finished",
  "attempt-aborted",
  "logical-operation-finished",
  "run-cancelled",
  "run-finished",
]);

export const TraceEventSchema = z.strictObject({
  schemaVersion: SchemaVersionSchema,
  runId: boundedId,
  side: z.enum(["baseline", "protected"]),
  atMs: z.number().min(0).max(60_000),
  sequence: z.number().int().min(0).max(20_000),
  kind: TraceEventKindSchema,
  operationId: boundedId,
  attemptIndex: z.number().int().min(0).max(4).optional(),
  outcome: OutcomeSchema.optional(),
  statusCode: z.number().int().min(100).max(599).optional(),
  durationMs: z.number().min(0).max(60_000).optional(),
  details: z.record(z.string(), z.unknown()).optional(),
});

export type FaultProfile = z.infer<typeof FaultProfileSchema>;
export type Scenario = z.infer<typeof ScenarioSchema>;
export type Workload = z.infer<typeof WorkloadSchema>;
export type AttemptRequest = z.infer<typeof AttemptRequestSchema>;
export type AttemptResponse = z.infer<typeof AttemptResponseSchema>;
export type SuccessBody = z.infer<typeof SuccessBodySchema>;
export type ProblemBody = z.infer<typeof ProblemBodySchema>;
export type Outcome = z.infer<typeof OutcomeSchema>;
export type TraceEvent = z.infer<typeof TraceEventSchema>;
export type TraceEventDraft = Omit<TraceEvent, "sequence">;
