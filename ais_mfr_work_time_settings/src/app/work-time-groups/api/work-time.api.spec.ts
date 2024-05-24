import { TestBed } from '@angular/core/testing';

import { WorkTimeApi } from './work-time.api';

describe('WorkTimeService', () => {
  let service: WorkTimeApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkTimeApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
