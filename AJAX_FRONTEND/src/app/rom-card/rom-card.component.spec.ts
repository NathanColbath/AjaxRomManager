import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RomCardComponent } from './rom-card.component';

describe('RomCardComponent', () => {
  let component: RomCardComponent;
  let fixture: ComponentFixture<RomCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RomCardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RomCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
