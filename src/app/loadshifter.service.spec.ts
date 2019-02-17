import { TestBed } from '@angular/core/testing';

import { LoadshifterService } from './loadshifter.service';

describe('LoadshifterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LoadshifterService = TestBed.get(LoadshifterService);
    expect(service).toBeTruthy();
  });
});
