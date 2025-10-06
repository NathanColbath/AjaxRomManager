import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Platform } from '../models/rom.model';
import { PlatformsService } from '../services/platforms.service';
import { FileUploadService } from '../services/file-upload.service';

@Component({
  selector: 'app-systems-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './systems-add.component.html',
  styleUrl: './systems-add.component.scss'
})
export class SystemsAddComponent implements OnInit {
  
  platform: Platform = new Platform();

  logoPreview: string | null = null;
  logoFile: File | null = null;
  isFormValid: boolean = false;
  isSaving: boolean = false;
  isUploading: boolean = false;
  uploadProgress: number = 0;

  // Extensions array for form binding
  extensionsArray: string[] = [''];

  constructor(
    private router: Router,
    private platformsService: PlatformsService,
    private fileUploadService: FileUploadService
  ) { }

  ngOnInit(): void {
    // Initialize platform with default values
    this.platform = new Platform({
      name: '',
      description: '',
      isActive: true,
      extensions: '[""]'
    });
    this.extensionsArray = [''];
  }

  onLogoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file
      const validation = this.fileUploadService.validateImageFile(file);
      if (!validation.isValid) {
        alert(validation.error);
        return;
      }
      
      this.logoFile = file;
      
      // Create preview
      this.fileUploadService.createPreviewUrl(file).then(previewUrl => {
        this.logoPreview = previewUrl;
        this.onFormChange();
      }).catch(error => {
        console.error('Error creating preview:', error);
        alert('Failed to create preview');
      });
    }
  }

  clearLogo(): void {
    this.logoFile = null;
    this.logoPreview = null;
    // Reset file input
    const fileInput = document.getElementById('platformLogo') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  addExtension(): void {
    this.extensionsArray.push('');
    this.onFormChange();
  }

  removeExtension(index: number): void {
    if (this.extensionsArray.length > 1) {
      this.extensionsArray.splice(index, 1);
      this.onFormChange();
    }
  }

  onFormChange(): void {
    // Debounce validation to prevent input field deselection
    setTimeout(() => {
      this.validateForm();
    }, 0);
  }

  validateForm(): void {
    // Simple validation without causing re-renders
    this.isFormValid = this.platform.name.trim() !== '' && 
                      this.extensionsArray.some(ext => ext.trim() !== '');
  }

  resetForm(): void {
    this.platform = new Platform({
      name: '',
      description: '',
      isActive: true,
      extensions: '[""]'
    });
    this.extensionsArray = [''];
    this.clearLogo();
    this.onFormChange();
  }

  savePlatform(): void {
    if (!this.isFormValid) {
      return;
    }

    this.isSaving = true;
    
    // Update platform with current extensions
    this.platform.extensions = JSON.stringify(this.extensionsArray.filter(ext => ext.trim() !== ''));
    
    // If there's a logo file, upload it first
    if (this.logoFile) {
      this.uploadLogoAndSave();
    } else {
      this.createPlatform();
    }
  }

  private uploadLogoAndSave(): void {
    this.isUploading = true;
    this.uploadProgress = 0;
    
    this.fileUploadService.uploadPlatformLogoWithProgress(this.logoFile!).subscribe({
      next: (response) => {
        if (typeof response === 'object' && 'percentage' in response) {
          // Progress update
          this.uploadProgress = response.percentage;
        } else if (typeof response === 'object' && 'filePath' in response) {
          // Upload complete
          this.platform.iconPath = response.filePath;
          this.isUploading = false;
          this.createPlatform();
        }
      },
      error: (error) => {
        console.error('Error uploading logo:', error);
        this.isUploading = false;
        alert('Failed to upload logo. Please try again.');
        this.isSaving = false;
      }
    });
  }

  private createPlatform(): void {
    this.platformsService.createPlatform(this.platform).subscribe({
      next: (createdPlatform) => {
        this.isSaving = false;
        alert('Platform created successfully!');
        this.router.navigate(['/systems-managment']);
      },
      error: (error) => {
        console.error('Error creating platform:', error);
        this.isSaving = false;
        alert('Failed to create platform. Please try again.');
      }
    });
  }

  // TrackBy function to prevent unnecessary re-rendering
  trackByExtension(index: number, extension: string): number {
    return index;
  }
}