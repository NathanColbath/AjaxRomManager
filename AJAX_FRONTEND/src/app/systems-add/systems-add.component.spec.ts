import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemsAddComponent } from './systems-add.component';

describe('SystemsAddComponent', () => {
  let component: SystemsAddComponent;
  let fixture: ComponentFixture<SystemsAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemsAddComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SystemsAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
