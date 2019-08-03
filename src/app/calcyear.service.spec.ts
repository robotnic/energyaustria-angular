import { TestBed } from '@angular/core/testing';

import { CalcyearService } from './calcyear.service';

describe('CalcyearService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CalcyearService = TestBed.get(CalcyearService);
    expect(service).toBeTruthy();
  });
});
