import { inject } from '@angular/core';
import { type ResolveFn } from '@angular/router';
import { StatesService } from '../services/task-container-services/states.service';
import { type ModelsStateDetail } from '../shared/libs/state.lib';

export const stateResolver: ResolveFn<ModelsStateDetail> = (route) => {
  const id = Number(route.paramMap.get('id'));
  return inject(StatesService).getState(id);
};
