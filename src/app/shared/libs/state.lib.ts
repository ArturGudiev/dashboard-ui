import {
  type ModelsStateFull,
  type ModelsStateRequirementFull,
  type EntStateRequirementCheck,
} from '../../types/generated';

export type ModelsStateDetail = ModelsStateFull & {
  requirements: ModelsStateRequirementFull[];
  childStates: ModelsStateFull[];
};

export type ModelsStateRequirementDetail = ModelsStateRequirementFull & {
  checks: EntStateRequirementCheck[];
};

export function getStateFullDescription(state: ModelsStateFull): string {
  return `State-${state.id} ${state.description ?? ''}`;
}

export function getStateRequirementFullDescription(requirement: ModelsStateRequirementFull): string {
  return `StateRequirement-${requirement.id} ${requirement.description ?? ''}`;
}
