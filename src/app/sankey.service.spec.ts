import { TestBed } from '@angular/core/testing';

import { SankeyService } from './sankey.service';

describe('SankeyService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SankeyService = TestBed.get(SankeyService);
    expect(service).toBeTruthy();
  });
});
