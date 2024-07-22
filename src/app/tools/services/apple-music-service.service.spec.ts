import { TestBed } from '@angular/core/testing';

import { AppleMusicService } from './apple-music-service.service';

describe('AppleMusicService', () => {
  let service: AppleMusicService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppleMusicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
