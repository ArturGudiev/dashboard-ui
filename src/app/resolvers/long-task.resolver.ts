import { inject } from '@angular/core';
import { type ResolveFn } from '@angular/router';
import { type EntLongTask } from '../types/generated';
import { LongTasksService } from '../services/task-container-services/long-tasks.service';

export const longTaskResolver: ResolveFn<EntLongTask> = (route) => {
  const id = Number(route.paramMap.get('id'));
  return inject(LongTasksService).getLongTask(id);
};
