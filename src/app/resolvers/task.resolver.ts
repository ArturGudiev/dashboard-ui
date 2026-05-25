import { inject } from '@angular/core';
import { type ResolveFn, Router } from '@angular/router';
import { of } from 'rxjs';
import { TaskC } from '../models/task-class';
import { isTaskCCreateSource } from '../shared/libs/task-api.lib';
import { TasksService } from '../services/task-container-services/tasks.service';

export const taskResolver: ResolveFn<TaskC> = (route) => {
  const id = Number(route.paramMap.get('id'));
  const navState = inject(Router).currentNavigation()?.extras.state;
  if (navState && isTaskCCreateSource(navState)) {
    const task = TaskC.createFromObj(navState);
    if (task.id === id) {
      return of(task);
    }
  }
  return inject(TasksService).getTask(id);
};
