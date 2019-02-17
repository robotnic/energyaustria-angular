import { TestBed } from '@angular/core/testing';

import { InstalledService } from './installed.service';

describe('InstalledService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InstalledService = TestBed.get(InstalledService);
    expect(service).toBeTruthy();
  });
});
