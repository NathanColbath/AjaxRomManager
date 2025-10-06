import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SystemSettingsService } from '../services/system-settings.service';
import { NotificationService } from '../services/notification.service';
import { ModalService } from '../services/modal.service';
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
    private notificationService: NotificationService,
    private modalService: ModalService
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

  // Reset Operations
  isResettingDatabase = false;
  isDeletingLocalData = false;

  /**
   * Resets the database and all settings
   */
  resetDatabase(): void {
    this.modalService.showConfirm(
      'Reset Database',
      'Are you sure you want to reset the database? This will permanently delete all platforms, ROMs, settings, and user data. This action cannot be undone.',
      'Reset Database',
      'Cancel'
    ).subscribe(result => {
      if (result.confirmed) {
        this.isResettingDatabase = true;
        
        this.systemSettingsService.resetDatabase().subscribe({
          next: (response) => {
            this.isResettingDatabase = false;
            this.notificationService.showPersistentSuccess(
              'Database Reset Complete',
              'The database has been successfully reset. All data has been cleared.'
            );
            
            // Reload the page to reflect the reset
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          },
          error: (error) => {
            this.isResettingDatabase = false;
            this.notificationService.showPersistentError(
              'Reset Failed',
              'Failed to reset the database. Please try again.'
            );
            console.error('Database reset error:', error);
          }
        });
      }
    });
  }

  /**
   * Deletes all local data (images and ROMs)
   */
  deleteLocalData(): void {
    this.modalService.showConfirm(
      'Delete Local Data',
      'Are you sure you want to delete all local data? This will permanently delete all ROM files and images from the file system. This action cannot be undone.',
      'Delete Data',
      'Cancel'
    ).subscribe(result => {
      if (result.confirmed) {
        this.isDeletingLocalData = true;
        
        this.systemSettingsService.deleteLocalData().subscribe({
          next: (response) => {
            this.isDeletingLocalData = false;
            const deletedFiles = response.deletedFiles || 0;
            this.notificationService.showPersistentSuccess(
              'Local Data Deleted',
              `Successfully deleted ${deletedFiles} files from the local file system.`
            );
          },
          error: (error) => {
            this.isDeletingLocalData = false;
            this.notificationService.showPersistentError(
              'Delete Failed',
              'Failed to delete local data. Please try again.'
            );
            console.error('Local data deletion error:', error);
          }
        });
      }
    });
  }
}
