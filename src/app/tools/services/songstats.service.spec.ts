import { TestBed } from '@angular/core/testing';

import { SongstatsService } from './songstats.service';

describe('SongstatsService', () => {
  let service: SongstatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SongstatsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
