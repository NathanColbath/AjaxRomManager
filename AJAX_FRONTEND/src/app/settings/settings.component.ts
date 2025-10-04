import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SystemSettingsService } from '../services/system-settings.service';
import { NotificationService } from '../services/notification.service';
import { ScanConfiguration, SetSettingRequest } from '../models/rom.model';

interface UserPreferences {
  theme: string;
  itemsPerPage: number;
  defaultView: string;
  emailNotifications: boolean;
  scanAlerts: boolean;
}

interface MetadataScanSettings {
  scanInterval: string;
  concurrentScans: number;
  fetchFromOnline: boolean;
  updateExistingMetadata: boolean;
  downloadImages: boolean;
}

interface BackupSettings {
  backupSchedule: string;
  backupRetention: number;
  cleanupOrphans: boolean;
  optimizeDatabase: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  
  // Settings objects
  scanConfiguration: ScanConfiguration = new ScanConfiguration();
  
  userPreferences: UserPreferences = {
    theme: 'light',
    itemsPerPage: 24,
    defaultView: 'grid',
    emailNotifications: true,
    scanAlerts: true
  };

  metadataScanSettings: MetadataScanSettings = {
    scanInterval: 'manual',
    concurrentScans: 2,
    fetchFromOnline: true,
    updateExistingMetadata: false,
    downloadImages: true
  };

  backupSettings: BackupSettings = {
    backupSchedule: 'weekly',
    backupRetention: 30,
    cleanupOrphans: false,
    optimizeDatabase: false
  };

  isLoading = false;
  isSaving = false;

  constructor(
    private systemSettingsService: SystemSettingsService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.isLoading = true;
    
    this.systemSettingsService.getScanConfiguration().subscribe({
      next: (config) => {
        this.scanConfiguration = config;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading settings:', error);
        this.notificationService.showError(
          'Settings Load Error',
          'Failed to load system settings. Please try again.'
        );
        this.isLoading = false;
      }
    });
  }

  saveSettings(): void {
    this.isSaving = true;
    
    this.systemSettingsService.updateScanConfiguration(this.scanConfiguration).subscribe({
      next: () => {
        this.notificationService.showSuccess(
          'Settings Saved',
          'System settings have been updated successfully.'
        );
        this.isSaving = false;
      },
      error: (error) => {
        console.error('Error saving settings:', error);
        this.notificationService.showError(
          'Settings Save Error',
          'Failed to save system settings. Please try again.'
        );
        this.isSaving = false;
      }
    });
  }

  resetToDefaults(): void {
    // Reset scan configuration to default values
    this.scanConfiguration = new ScanConfiguration();
    
    this.userPreferences = {
      theme: 'light',
      itemsPerPage: 24,
      defaultView: 'grid',
      emailNotifications: true,
      scanAlerts: true
    };

    this.metadataScanSettings = {
      scanInterval: 'manual',
      concurrentScans: 2,
      fetchFromOnline: true,
      updateExistingMetadata: false,
      downloadImages: true
    };

    this.backupSettings = {
      backupSchedule: 'weekly',
      backupRetention: 30,
      cleanupOrphans: false,
      optimizeDatabase: false
    };
    
    this.notificationService.showInfo(
      'Settings Reset',
      'Settings have been reset to default values. Click Save to apply changes.'
    );
  }

  onFolderSelect(field: string): void {
    // TODO: Implement folder selection dialog
    console.log(`Opening folder selector for: ${field}`);
  }
}
