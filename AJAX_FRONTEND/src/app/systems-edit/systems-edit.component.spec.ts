import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { SystemsEditComponent } from './systems-edit.component';

describe('SystemsEditComponent', () => {
  let component: SystemsEditComponent;
  let fixture: ComponentFixture<SystemsEditComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue('1')
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [SystemsEditComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load platform on init', () => {
    spyOn(component, 'loadPlatform');
    component.ngOnInit();
    expect(component.loadPlatform).toHaveBeenCalled();
  });

  it('should validate form correctly', () => {
    component.platform.name = '';
    component.platform.extension = '';
    component.validateForm();
    expect(component.isFormValid).toBeFalse();
    expect(component.formErrors['name']).toBe('Platform name is required');
    expect(component.formErrors['extension']).toBe('File extension is required');
  });

  it('should detect unsaved changes', () => {
    component.platform.name = 'Test Platform';
    component.originalPlatform.name = 'Original Platform';
    component.checkForUnsavedChanges();
    expect(component.hasUnsavedChanges).toBeTrue();
  });
});
