import { TestBed } from '@angular/core/testing';

import { TaskContainerService } from './task-container.service';

describe('TaskContainerService', () => {
  let service: TaskContainerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskContainerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
