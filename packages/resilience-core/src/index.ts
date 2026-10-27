export { runBaseline } from './baseline/run-baseline.js';
export type {
  BaselineDependencies,
  BaselineOperation,
  BaselineRunInput,
  LogicalOperationResult,
  RunSnapshot,
} from './baseline/run-baseline.js';
export { SystemClock } from './ports/clock.port.js';
export type { Clock } from './ports/clock.port.js';
export { SyntheticTransportError } from './ports/transport.port.js';
export type { TelemetrySink, Transport } from './ports/transport.port.js';
