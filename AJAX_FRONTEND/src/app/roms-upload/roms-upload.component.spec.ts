import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RomsUploadComponent } from './roms-upload.component';

describe('RomsUploadComponent', () => {
  let component: RomsUploadComponent;
  let fixture: ComponentFixture<RomsUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RomsUploadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RomsUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
