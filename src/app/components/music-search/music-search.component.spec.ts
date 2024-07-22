import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MusicSearchComponent } from './music-search.component';

describe('MusicSearchComponent', () => {
  let component: MusicSearchComponent;
  let fixture: ComponentFixture<MusicSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MusicSearchComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MusicSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
