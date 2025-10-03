import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemsManagmentComponent } from './systems-managment.component';

describe('SystemsManagmentComponent', () => {
  let component: SystemsManagmentComponent;
  let fixture: ComponentFixture<SystemsManagmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemsManagmentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SystemsManagmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
