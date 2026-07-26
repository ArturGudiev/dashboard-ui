import { inject } from '@angular/core';
import { type ResolveFn, Router } from '@angular/router';
import { of } from 'rxjs';
import { TaskC } from '../models/task-class';
import { TasksService } from '../services/task-container-services/tasks.service';

export const taskResolver: ResolveFn<TaskC> = (route) => {
  const id = Number(route.paramMap.get('id'));
  const navState = inject(Router).currentNavigation()?.extras.state;
  // Only reuse in-memory TaskC from the current navigation (e.g. navigateToTask).
  // History state is a plain object after refresh/structuredClone and can be stale
  // (missing newer fields like checks) — always refetch in that case.
  if (navState instanceof TaskC && navState.id === id) {
    return of(navState);
  }
  return inject(TasksService).getTask(id);
};
