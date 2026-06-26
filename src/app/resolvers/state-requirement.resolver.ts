import { inject } from '@angular/core';
import { type ResolveFn } from '@angular/router';
import { StatesService } from '../services/task-container-services/states.service';
import { type ModelsStateRequirementDetail } from '../shared/libs/state.lib';

export const stateRequirementResolver: ResolveFn<ModelsStateRequirementDetail> = (route) => {
  const id = Number(route.paramMap.get('id'));
  return inject(StatesService).getStateRequirement(id);
};
