import { TestBed } from '@angular/core/testing';

import { ExternalSearchService } from './external-search.service';

describe('ExternalSearchService', () => {
  let service: ExternalSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExternalSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
