import { TestBed } from '@angular/core/testing';
import { type ResolveFn } from '@angular/router';

import { type TaskC } from '../models/task-class';
import { taskResolver } from './task.resolver';

describe('taskResolverResolver', () => {
  const executeResolver: ResolveFn<TaskC> = (...resolverParameters) =>
      TestBed.runInInjectionContext(() => taskResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
