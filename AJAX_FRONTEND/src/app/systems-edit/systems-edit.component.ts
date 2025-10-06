import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform } from '../models/rom.model';
import { PlatformsService } from '../services/platforms.service';
import { FileUploadService } from '../services/file-upload.service';

@Component({
  selector: 'app-systems-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './systems-edit.component.html',
  styleUrl: './systems-edit.component.scss'
})
export class SystemsEditComponent implements OnInit {
  
  platform: Platform = new Platform();
  originalPlatform: Platform = new Platform();
  
  // Form state
  isFormValid: boolean = false;
  hasUnsavedChanges: boolean = false;
  isLoading: boolean = false;
  isSaving: boolean = false;
  
  // File upload
  logoPreview: string | null = null;
  logoFile: File | null = null;
  uploadProgress: number = 0;
  isUploading: boolean = false;
  
  // Form validation
  formErrors: { [key: string]: string } = {};
  
  // Expose Object to template
  Object = Object;
  
  // Extensions array for form binding
  extensionsArray: string[] = [];
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private platformsService: PlatformsService,
    private fileUploadService: FileUploadService
  ) {}

  ngOnInit(): void {
    this.loadPlatform();
  }

  loadPlatform(): void {
    this.isLoading = true;
    
    // Get platform ID from route
    const platformId = this.route.snapshot.paramMap.get('id');
    
    if (platformId) {
      this.platformsService.getPlatformById(parseInt(platformId)).subscribe({
        next: (platform) => {
          this.platform = platform;
          this.originalPlatform = new Platform(platform);
          
          // Parse extensions from JSON string
          if (platform.extensions) {
            try {
              this.extensionsArray = JSON.parse(platform.extensions);
            } catch {
              this.extensionsArray = platform.extensions.split(',').map(ext => ext.trim());
            }
          } else {
            this.extensionsArray = [''];
          }
          
          // Set logo preview if exists
          if (platform.iconPath) {
            this.logoPreview = this.fileUploadService.getPlatformLogoUrl(platform.iconPath);
          }
          
          this.validateForm();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading platform:', error);
          this.isLoading = false;
          alert('Failed to load platform. Redirecting to platform management.');
          this.router.navigate(['/systems-managment']);
        }
      });
    } else {
      // No ID provided, redirect to management
      this.router.navigate(['/systems-managment']);
    }
  }

  getMockPlatform(id: number): Platform {
    // Mock data - replace with actual API call
    const mockPlatforms = [
      {
        id: 1,
        name: 'Nintendo Entertainment System',
        description: '8-bit home video game console released by Nintendo',
        extension: 'nes',
        emulatorPath: '/emulators/fceux.exe',
        iconPath: '',
        isActive: true,
        createdAt: new Date('2024-01-15'),
        extensions: ['nes']
      },
      {
        id: 2,
        name: 'Super Nintendo Entertainment System',
        description: '16-bit home video game console',
        extension: 'snes',
        emulatorPath: '/emulators/snes9x.exe',
        iconPath: '',
        isActive: true,
        createdAt: new Date('2024-01-16'),
        extensions: '["snes", "smc"]'
      },
      {
        id: 3,
        name: 'Game Boy',
        description: '8-bit handheld game console',
        extension: 'gb',
        emulatorPath: '/emulators/vba.exe',
        iconPath: '',
        isActive: false,
        createdAt: new Date('2024-01-17'),
        extensions: '["gb"]'
      }
    ];
    
    const mockPlatform = mockPlatforms.find(p => p.id === id);
    if (mockPlatform) {
      return new Platform(mockPlatform as any);
    }
    
    // Default platform if not found
    return new Platform({
      id: id,
      name: '',
      description: '',
      extension: '',
      isActive: true,
      createdAt: new Date(),
      extensions: '[""]'
    });
  }

  onFormChange(): void {
    // Debounce validation to prevent input field deselection
    setTimeout(() => {
      this.validateForm();
      this.checkForUnsavedChanges();
    }, 0);
  }

  validateForm(): void {
    this.formErrors = {};
    
    // Validate platform name
    if (!this.platform.name || this.platform.name.trim().length === 0) {
      this.formErrors['name'] = 'Platform name is required';
    } else if (this.platform.name.length > 100) {
      this.formErrors['name'] = 'Platform name must be 100 characters or less';
    }
    
    // Validate extensions
    const validExtensions = this.extensionsArray.filter(ext => ext.trim() !== '');
    if (validExtensions.length === 0) {
      this.formErrors['extensions'] = 'At least one file extension is required';
    } else {
      // Validate each extension
      validExtensions.forEach((ext, index) => {
        if (ext.length > 10) {
          this.formErrors[`extension${index}`] = 'File extension must be 10 characters or less';
        } else if (!/^[a-zA-Z0-9]+$/.test(ext)) {
          this.formErrors[`extension${index}`] = 'File extension can only contain letters and numbers';
        }
      });
    }
    
    // Validate emulator path if provided
    if (this.platform.emulatorPath && this.platform.emulatorPath.length > 500) {
      this.formErrors['emulatorPath'] = 'Emulator path must be 500 characters or less';
    }
    
    // Check if form is valid
    this.isFormValid = Object.keys(this.formErrors).length === 0 && 
                      (this.platform.name?.trim()?.length || 0) > 0 && 
                      validExtensions.length > 0;
  }

  checkForUnsavedChanges(): void {
    this.hasUnsavedChanges = JSON.stringify(this.platform) !== JSON.stringify(this.originalPlatform);
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
    this.platform.iconPath = '';
    
    // Reset file input
    const fileInput = document.getElementById('platformLogo') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    
    this.onFormChange();
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

  savePlatform(): void {
    if (!this.isFormValid) {
      return;
    }
    
    this.isSaving = true;
    
    // Update platform with current extensions
    this.platform.extensions = JSON.stringify(this.extensionsArray.filter(ext => ext.trim() !== ''));
    
    // If there's a new logo file, upload it first
    if (this.logoFile) {
      this.uploadLogoAndSave();
    } else {
      this.updatePlatform();
    }
  }

  private uploadLogoAndSave(): void {
    this.isUploading = true;
    this.uploadProgress = 0;
    
    this.fileUploadService.uploadPlatformLogoWithProgress(this.logoFile!, this.platform.id).subscribe({
      next: (response) => {
        if (typeof response === 'object' && 'percentage' in response) {
          // Progress update
          this.uploadProgress = response.percentage;
        } else if (typeof response === 'object' && 'filePath' in response) {
          // Upload complete
          this.platform.iconPath = response.filePath;
          this.isUploading = false;
          this.updatePlatform();
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

  private updatePlatform(): void {
    this.platformsService.updatePlatform(this.platform.id!, this.platform).subscribe({
      next: (updatedPlatform) => {
        this.originalPlatform = new Platform(updatedPlatform);
        this.hasUnsavedChanges = false;
        this.isSaving = false;
        
        alert('Platform saved successfully!');
        this.router.navigate(['/systems-managment']);
      },
      error: (error) => {
        console.error('Error updating platform:', error);
        this.isSaving = false;
        alert('Failed to save platform. Please try again.');
      }
    });
  }

  cancelEdit(): void {
    if (this.hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        this.router.navigate(['/systems-managment']);
      }
    } else {
      this.router.navigate(['/systems-managment']);
    }
  }

  deletePlatform(): void {
    if (confirm(`Are you sure you want to delete "${this.platform.name}"? This action cannot be undone.`)) {
      this.isSaving = true;
      
      // Delete logo file if it exists
      if (this.platform.iconPath) {
        this.fileUploadService.deletePlatformLogo(this.platform.iconPath).subscribe({
          next: () => {
            this.deletePlatformFromDatabase();
          },
          error: (error) => {
            console.error('Error deleting logo:', error);
            // Continue with platform deletion even if logo deletion fails
            this.deletePlatformFromDatabase();
          }
        });
      } else {
        this.deletePlatformFromDatabase();
      }
    }
  }

  private deletePlatformFromDatabase(): void {
    this.platformsService.deletePlatform(this.platform.id!).subscribe({
      next: () => {
        this.isSaving = false;
        alert('Platform deleted successfully!');
        this.router.navigate(['/systems-managment']);
      },
      error: (error) => {
        console.error('Error deleting platform:', error);
        this.isSaving = false;
        alert('Failed to delete platform. Please try again.');
      }
    });
  }

  resetForm(): void {
    this.platform = new Platform(this.originalPlatform);
    this.extensionsArray = [...this.extensionsArray];
    this.logoPreview = this.platform.iconPath || null;
    this.logoFile = null;
    this.formErrors = {};
    this.validateForm();
    this.hasUnsavedChanges = false;
  }

  onFolderSelect(field: string): void {
    // TODO: Implement folder selection dialog
    console.log(`Opening folder selector for: ${field}`);
  }

  getFieldError(fieldName: string): string {
    return this.formErrors[fieldName] || '';
  }

  hasFieldError(fieldName: string): boolean {
    return !!this.formErrors[fieldName];
  }

  // TrackBy function to prevent unnecessary re-rendering
  trackByExtension(index: number, extension: string): number {
    return index;
  }
}
