import { TestBed } from '@angular/core/testing';

import { AliasesService } from './aliases.service';

describe('AliasesService', () => {
  let service: AliasesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AliasesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
