import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Platform {
  id?: number;
  name: string;
  description: string;
  extension: string;
  iconPath: string;
  isActive: boolean;
  extensions: string[];
}

@Component({
  selector: 'app-systems-add',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './systems-add.component.html',
  styleUrl: './systems-add.component.scss'
})
export class SystemsAddComponent implements OnInit {
  
  platform: Platform = {
    name: '',
    description: '',
    extension: '',
    iconPath: '',
    isActive: true,
    extensions: ['']
  };

  logoPreview: string | null = null;
  logoFile: File | null = null;
  isFormValid: boolean = false;

  constructor() { }

  ngOnInit(): void {
    // Initialize with one empty extension
    this.platform.extensions = [''];
  }

  onLogoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.logoFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
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
    this.platform.extensions.push('');
    this.onFormChange();
  }

  removeExtension(index: number): void {
    if (this.platform.extensions.length > 1) {
      this.platform.extensions.splice(index, 1);
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
                      this.platform.extensions.some(ext => ext.trim() !== '');
  }

  resetForm(): void {
    this.platform = {
      name: '',
      description: '',
      extension: '',
      iconPath: '',
      isActive: true,
      extensions: ['']
    };
    this.clearLogo();
    this.onFormChange();
  }

  savePlatform(): void {
    if (!this.isFormValid) {
      return;
    }

    // Filter out empty extensions
    const validExtensions = this.platform.extensions.filter(ext => ext.trim() !== '');
    
    const platformData = {
      ...this.platform,
      extensions: validExtensions
    };

    console.log('Saving platform:', platformData);
    
    // TODO: Implement API call to save platform
    // TODO: Handle logo upload
    // TODO: Show success/error messages
    // TODO: Navigate back to platform management
  }

  // TrackBy function to prevent unnecessary re-rendering
  trackByExtension(index: number, extension: string): number {
    return index;
  }
}