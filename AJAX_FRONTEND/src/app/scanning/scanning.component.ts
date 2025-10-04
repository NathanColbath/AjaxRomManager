import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ScanningService } from '../services/scanning.service';
import { ScanningSignalRService } from '../services/scanning-signalr.service';
import { SystemSettingsService } from '../services/system-settings.service';
import { 
  ScanJob, 
  ScanProgress, 
  ScanConfiguration, 
  StartScanRequest, 
  RecurringScanRequest,
  ScanHistoryRequest,
  ScanProgressMessage,
  Platform,
  PagedResult
} from '../models/rom.model';

@Component({
  selector: 'app-scanning',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './scanning.component.html',
  styleUrl: './scanning.component.scss'
})
export class ScanningComponent implements OnInit, OnDestroy {
  // Connection and loading states
  isConnected = false;
  isLoading = false;
  error: string | null = null;

  // Scan configuration
  scanConfiguration: ScanConfiguration = new ScanConfiguration();
  platforms: Platform[] = [];
  
  // Current scan form
  scanDirectory = '';
  selectedPlatformId: number | undefined;
  scanName = '';
  isRecurring = false;
  cronExpression = '0 2 * * *'; // Daily at 2 AM

  // Active scans
  activeScans: ScanJob[] = [];
  currentScan: ScanJob | null = null;
  currentProgress: ScanProgress | null = null;

  // Scan history
  scanHistory: ScanJob[] = [];
  historyRequest: ScanHistoryRequest = new ScanHistoryRequest();
  totalHistoryItems = 0;
  currentPage = 1;
  pageSize = 20;

  // Real-time messages
  recentMessages: ScanProgressMessage[] = [];
  showMessages = true;

  // UI state
  activeTab: 'scan' | 'active' | 'history' | 'settings' = 'scan';
  showAdvancedOptions = false;

  constructor(
    private scanningService: ScanningService,
    private signalRService: ScanningSignalRService,
    private systemSettingsService: SystemSettingsService
  ) {}

  async ngOnInit() {
    await this.initializeComponent();
  }

  async ngOnDestroy() {
    await this.cleanup();
  }

  private async initializeComponent() {
    try {
      this.isLoading = true;
      
      // Start SignalR connection
      await this.signalRService.startConnection();
      this.isConnected = true;
      
      // Join all scans group for notifications
      await this.signalRService.joinAllScansGroup();
      
      // Setup event handlers
      this.setupSignalREventHandlers();
      
      // Load initial data
      await Promise.all([
        this.loadScanConfiguration(),
        this.loadPlatforms(),
        this.loadActiveScans(),
        this.loadScanHistory()
      ]);
      
    } catch (error) {
      console.error('Failed to initialize scanning component:', error);
      this.error = 'Failed to initialize scanning interface';
      this.isConnected = false;
    } finally {
      this.isLoading = false;
    }
  }

  private async cleanup() {
    try {
      if (this.currentScan) {
        await this.signalRService.leaveScanGroup(this.currentScan.id!);
      }
      await this.signalRService.leaveAllScansGroup();
      await this.signalRService.stopConnection();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  private setupSignalREventHandlers() {
    // Handle scan started
    this.signalRService.onScanStarted((message: ScanProgressMessage) => {
      this.addRecentMessage(message);
      this.loadActiveScans();
    });

    // Handle scan progress updates
    this.signalRService.onScanProgress((message: ScanProgressMessage) => {
      if (message.progress) {
        this.currentProgress = message.progress;
        if (this.currentScan && this.currentScan.id === message.scanJobId) {
          this.currentScan.filesProcessed = message.progress.filesProcessed;
          this.currentScan.errors = message.progress.errors;
        }
      }
      this.addRecentMessage(message);
    });

    // Handle scan completed
    this.signalRService.onScanCompleted((message: ScanProgressMessage) => {
      this.addRecentMessage(message);
      this.loadActiveScans();
      this.loadScanHistory();
    });

    // Handle scan failed
    this.signalRService.onScanFailed((message: ScanProgressMessage) => {
      this.addRecentMessage(message);
      this.loadActiveScans();
      this.loadScanHistory();
    });

    // Handle scan cancelled
    this.signalRService.onScanCancelled((message: ScanProgressMessage) => {
      this.addRecentMessage(message);
      this.loadActiveScans();
      this.loadScanHistory();
    });

    // Handle new scan job created
    this.signalRService.onScanJobCreated((message: ScanProgressMessage) => {
      this.addRecentMessage(message);
    });
  }

  private addRecentMessage(message: ScanProgressMessage) {
    this.recentMessages.unshift(message);
    
    // Keep only the last 20 messages
    if (this.recentMessages.length > 20) {
      this.recentMessages = this.recentMessages.slice(0, 20);
    }
  }

  // Scan Management Methods
  async startScan() {
    if (!this.scanDirectory.trim()) {
      this.error = 'Please specify a directory path';
      return;
    }

    try {
      this.error = null;
      const request = new StartScanRequest({
        directoryPath: this.scanDirectory,
        platformId: this.selectedPlatformId,
        name: this.scanName || `Scan - ${new Date().toLocaleString()}`,
        options: {
          recursive: this.scanConfiguration.recursive,
          autoDetectPlatform: this.scanConfiguration.autoDetectPlatform,
          createMetadata: this.scanConfiguration.createMetadata,
          skipDuplicates: this.scanConfiguration.skipDuplicates,
          includeSubdirectories: this.scanConfiguration.includeSubdirectories,
          maxFileSizeMB: this.scanConfiguration.maxFileSizeMB
        }
      });

      const scanJob = await this.scanningService.startScan(request).toPromise();
      this.currentScan = scanJob;
      
      // Join the specific scan group for detailed updates
      await this.signalRService.joinScanGroup(scanJob.id!);
      
      // Switch to active scans tab
      this.activeTab = 'active';
      
    } catch (error) {
      console.error('Failed to start scan:', error);
      this.error = 'Failed to start scan. Please check the directory path and try again.';
    }
  }

  async startRecurringScan() {
    if (!this.scanDirectory.trim()) {
      this.error = 'Please specify a directory path';
      return;
    }

    try {
      this.error = null;
      const request = new RecurringScanRequest({
        directoryPath: this.scanDirectory,
        platformId: this.selectedPlatformId,
        cronExpression: this.cronExpression,
        name: this.scanName || `Recurring Scan - ${new Date().toLocaleString()}`,
        options: {
          recursive: this.scanConfiguration.recursive,
          autoDetectPlatform: this.scanConfiguration.autoDetectPlatform,
          createMetadata: this.scanConfiguration.createMetadata,
          skipDuplicates: this.scanConfiguration.skipDuplicates,
          includeSubdirectories: this.scanConfiguration.includeSubdirectories,
          maxFileSizeMB: this.scanConfiguration.maxFileSizeMB
        }
      });

      await this.scanningService.startRecurringScan(request).toPromise();
      
      // Switch to active scans tab
      this.activeTab = 'active';
      
    } catch (error) {
      console.error('Failed to start recurring scan:', error);
      this.error = 'Failed to start recurring scan. Please check the directory path and try again.';
    }
  }

  async stopScan(scanJobId: number) {
    try {
      await this.scanningService.stopScan(scanJobId).toPromise();
      await this.loadActiveScans();
    } catch (error) {
      console.error('Failed to stop scan:', error);
      this.error = 'Failed to stop scan.';
    }
  }

  async cancelScan(scanJobId: number) {
    try {
      await this.scanningService.cancelScan(scanJobId).toPromise();
      await this.loadActiveScans();
    } catch (error) {
      console.error('Failed to cancel scan:', error);
      this.error = 'Failed to cancel scan.';
    }
  }

  async retryScan(scanJobId: number) {
    try {
      await this.scanningService.retryScan(scanJobId).toPromise();
      await this.loadActiveScans();
    } catch (error) {
      console.error('Failed to retry scan:', error);
      this.error = 'Failed to retry scan.';
    }
  }

  async deleteScan(scanJobId: number) {
    if (!confirm('Are you sure you want to delete this scan job?')) {
      return;
    }

    try {
      await this.scanningService.deleteScanJob(scanJobId).toPromise();
      await this.loadScanHistory();
      await this.loadActiveScans();
    } catch (error) {
      console.error('Failed to delete scan:', error);
      this.error = 'Failed to delete scan.';
    }
  }

  // Data Loading Methods
  async loadScanConfiguration() {
    try {
      this.scanConfiguration = await this.scanningService.getScanConfiguration().toPromise() || new ScanConfiguration();
    } catch (error) {
      console.error('Failed to load scan configuration:', error);
      // Use default configuration if loading fails
      this.scanConfiguration = new ScanConfiguration();
    }
  }

  async loadPlatforms() {
    try {
      // This would need to be implemented in the API service
      // For now, we'll use a placeholder
      this.platforms = [];
    } catch (error) {
      console.error('Failed to load platforms:', error);
    }
  }

  async loadActiveScans() {
    try {
      this.activeScans = await this.scanningService.getActiveScans().toPromise() || [];
    } catch (error) {
      console.error('Failed to load active scans:', error);
      this.activeScans = [];
    }
  }

  async loadScanHistory() {
    try {
      const result = await this.scanningService.getScanHistory(this.historyRequest).toPromise();
      if (result) {
        this.scanHistory = result.items;
        this.totalHistoryItems = result.totalCount;
        this.currentPage = result.page;
      }
    } catch (error) {
      console.error('Failed to load scan history:', error);
      this.scanHistory = [];
    }
  }

  async loadNextPage() {
    if (this.currentPage * this.pageSize < this.totalHistoryItems) {
      this.currentPage++;
      this.historyRequest.page = this.currentPage;
      await this.loadScanHistory();
    }
  }

  async loadPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.historyRequest.page = this.currentPage;
      await this.loadScanHistory();
    }
  }

  async refreshData() {
    await Promise.all([
      this.loadActiveScans(),
      this.loadScanHistory()
    ]);
  }

  // Utility Methods
  getScanStatusClass(status: string): string {
    return status.toLowerCase();
  }

  getProgressPercentage(scan: ScanJob): number {
    if (!scan.filesFound || scan.filesFound === 0) return 0;
    return Math.round((scan.filesProcessed / scan.filesFound) * 100);
  }

  formatFileSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(date: Date | string): string {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleString();
  }

  // UI Methods
  selectTab(tab: 'scan' | 'active' | 'history' | 'settings') {
    this.activeTab = tab;
  }

  toggleAdvancedOptions() {
    this.showAdvancedOptions = !this.showAdvancedOptions;
  }

  clearError() {
    this.error = null;
  }

  clearMessages() {
    this.recentMessages = [];
  }

  // Configuration Methods
  async saveConfiguration() {
    try {
      this.scanConfiguration = await this.scanningService.updateScanConfiguration(this.scanConfiguration).toPromise() || this.scanConfiguration;
      this.error = null;
    } catch (error) {
      console.error('Failed to save configuration:', error);
      this.error = 'Failed to save configuration.';
    }
  }

  async setDefaultDirectory() {
    if (!this.scanDirectory.trim()) {
      this.error = 'Please specify a directory path';
      return;
    }

    try {
      await this.scanningService.setScanDirectory(this.scanDirectory).toPromise();
      this.error = null;
    } catch (error) {
      console.error('Failed to set default directory:', error);
      this.error = 'Failed to set default directory.';
    }
  }
}
