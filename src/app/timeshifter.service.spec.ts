import { TestBed } from '@angular/core/testing';

import { TimeshifterService } from './timeshifter.service';

describe('TimeshifterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TimeshifterService = TestBed.get(TimeshifterService);
    expect(service).toBeTruthy();
  });
});
