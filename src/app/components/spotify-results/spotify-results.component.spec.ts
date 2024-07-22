import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpotifyResultsComponent } from './spotify-results.component';

describe('SpotifyResultsComponent', () => {
  let component: SpotifyResultsComponent;
  let fixture: ComponentFixture<SpotifyResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpotifyResultsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SpotifyResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
