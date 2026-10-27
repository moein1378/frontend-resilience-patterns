import scenarioJson from '../../../specs/scenarios.json' with { type: 'json' };
import workloadJson from '../../../specs/workloads.json' with { type: 'json' };
import { ScenarioCollectionSchema, WorkloadCollectionSchema } from '@frp/contracts';

export const builtInScenarios = Object.freeze(ScenarioCollectionSchema.parse(scenarioJson));
export const builtInWorkloads = Object.freeze(WorkloadCollectionSchema.parse(workloadJson));

export function findScenario(id: string) {
  return builtInScenarios.find((scenario) => scenario.id === id);
}

export function findWorkload(id: string) {
  return builtInWorkloads.find((workload) => workload.id === id);
}
