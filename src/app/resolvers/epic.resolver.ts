import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Epic } from '../models/epic';
import { EpicsService } from '../services/task-container-services/epics.service';

export const epicResolver: ResolveFn<Epic> = (route) => {
  const epicId = Number(route.paramMap.get('epicId'));
  return inject(EpicsService).getEpic(epicId);
};
