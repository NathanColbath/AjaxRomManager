import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SystemSettings {
  dbConnection: string;
  romStoragePath: string;
  logLevel: string;
  maxFileSize: number;
}

interface UserPreferences {
  theme: string;
  itemsPerPage: number;
  defaultView: string;
  emailNotifications: boolean;
  scanAlerts: boolean;
}

interface FileScanSettings {
  scanInterval: string;
  concurrentScans: number;
  handleDuplicates: boolean;
  scanSubdirectories: boolean;
  validateFileIntegrity: boolean;
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
  systemSettings: SystemSettings = {
    dbConnection: '',
    romStoragePath: '',
    logLevel: 'Information',
    maxFileSize: 1000
  };

  userPreferences: UserPreferences = {
    theme: 'light',
    itemsPerPage: 24,
    defaultView: 'grid',
    emailNotifications: true,
    scanAlerts: true
  };

  fileScanSettings: FileScanSettings = {
    scanInterval: 'manual',
    concurrentScans: 3,
    handleDuplicates: false,
    scanSubdirectories: true,
    validateFileIntegrity: true
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

  constructor() { }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    // TODO: Load settings from API
    console.log('Loading settings...');
  }

  saveSettings(): void {
    // TODO: Save settings to API
    console.log('Saving settings...', {
      system: this.systemSettings,
      user: this.userPreferences,
      fileScan: this.fileScanSettings,
      metadataScan: this.metadataScanSettings,
      backup: this.backupSettings
    });
  }

  resetToDefaults(): void {
    // Reset all settings to default values
    this.systemSettings = {
      dbConnection: '',
      romStoragePath: '',
      logLevel: 'Information',
      maxFileSize: 1000
    };

    this.userPreferences = {
      theme: 'light',
      itemsPerPage: 24,
      defaultView: 'grid',
      emailNotifications: true,
      scanAlerts: true
    };

    this.fileScanSettings = {
      scanInterval: 'manual',
      concurrentScans: 3,
      handleDuplicates: false,
      scanSubdirectories: true,
      validateFileIntegrity: true
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
  }

  onFolderSelect(field: string): void {
    // TODO: Implement folder selection dialog
    console.log(`Opening folder selector for: ${field}`);
  }
}
