import { TestBed } from '@angular/core/testing';
import { type ResolveFn } from '@angular/router';

import { taskResolver } from './task.resolver';

describe('taskResolverResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) =>
      TestBed.runInInjectionContext(() => taskResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
