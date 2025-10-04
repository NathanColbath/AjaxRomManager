import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemCardComponent } from './system-card.component';

describe('SystemCardComponent', () => {
  let component: SystemCardComponent;
  let fixture: ComponentFixture<SystemCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
