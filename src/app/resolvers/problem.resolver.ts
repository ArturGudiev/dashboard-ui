import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Problem } from '../models/problem';
import { ProblemsService } from '../services/task-container-services/problems.service';

export const problemResolver: ResolveFn<Problem> = (route) => {
  const id = Number(route.paramMap.get('id'));
  return inject(ProblemsService).getProblem(id);
};
