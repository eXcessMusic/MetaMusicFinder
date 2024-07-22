import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpotifyDetailComponent } from './spotify-detail.component';

describe('SpotifyDetailComponent', () => {
  let component: SpotifyDetailComponent;
  let fixture: ComponentFixture<SpotifyDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpotifyDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SpotifyDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
