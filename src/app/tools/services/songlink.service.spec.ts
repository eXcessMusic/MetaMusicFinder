import { TestBed } from '@angular/core/testing';

import { SonglinkService } from './songlink.service';

describe('SonglinkService', () => {
  let service: SonglinkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SonglinkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
