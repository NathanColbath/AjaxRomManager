import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Platform } from '../models/rom.model';

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
  
  // Form validation
  formErrors: { [key: string]: string } = {};
  
  // Expose Object to template
  Object = Object;
  
  // Extensions array for form binding
  extensionsArray: string[] = [];
  
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPlatform();
  }

  loadPlatform(): void {
    this.isLoading = true;
    
    // Get platform ID from route
    const platformId = this.route.snapshot.paramMap.get('id');
    
    if (platformId) {
      // TODO: Replace with actual API call
      // For now, simulate loading with mock data
      setTimeout(() => {
        this.platform = this.getMockPlatform(parseInt(platformId));
        this.originalPlatform = { ...this.platform } as Platform;
        this.extensionsArray = [...(this.platform as any).extensionsList];
        this.validateForm();
        this.isLoading = false;
      }, 500);
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
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      this.logoFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreview = e.target.result;
        this.platform.iconPath = e.target.result; // Store as base64 for now
        this.onFormChange();
      };
      reader.readAsDataURL(file);
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
    (this.platform as any).extensionsList = this.extensionsArray.filter(ext => ext.trim() !== '');
    
    const platformData = {
      ...this.platform
    };
    
    // TODO: Replace with actual API call
    setTimeout(() => {
      console.log('Saving platform:', platformData);
      
      // Simulate API success
      this.originalPlatform = { ...this.platform } as Platform;
      this.hasUnsavedChanges = false;
      this.isSaving = false;
      
      // Show success message (you could implement a toast service)
      alert('Platform saved successfully!');
      
      // Navigate back to management
      this.router.navigate(['/systems-managment']);
    }, 1000);
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
      // TODO: Replace with actual API call
      console.log('Deleting platform:', this.platform);
      
      // Simulate API success
      alert('Platform deleted successfully!');
      this.router.navigate(['/systems-managment']);
    }
  }

  resetForm(): void {
    this.platform = { ...this.originalPlatform } as Platform;
    this.extensionsArray = [...(this.platform as any).extensionsList];
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
