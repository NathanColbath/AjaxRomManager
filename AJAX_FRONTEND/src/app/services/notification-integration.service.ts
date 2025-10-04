import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService } from './notification.service';
import { ScanningSignalRService } from './scanning-signalr.service';
import { ScanProgressMessage } from '../models/rom.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationIntegrationService implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  constructor(
    private notificationService: NotificationService,
    private signalRService: ScanningSignalRService
  ) {}

  ngOnInit(): void {
    this.initializeSignalRNotifications();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Initialize SignalR event listeners for notifications
   */
  private initializeSignalRNotifications(): void {
    // Listen for scan started events
    this.signalRService.onScanStarted((message: ScanProgressMessage) => {
      this.handleScanStarted(message);
    });

    // Listen for scan progress events
    this.signalRService.onScanProgress((message: ScanProgressMessage) => {
      this.handleScanProgress(message);
    });

    // Listen for scan completed events
    this.signalRService.onScanCompleted((message: ScanProgressMessage) => {
      this.handleScanCompleted(message);
    });

    // Listen for scan failed events
    this.signalRService.onScanFailed((message: ScanProgressMessage) => {
      this.handleScanFailed(message);
    });

    // Listen for scan cancelled events
    this.signalRService.onScanCancelled((message: ScanProgressMessage) => {
      this.handleScanCancelled(message);
    });

    // Listen for scan job created events
    this.signalRService.onScanJobCreated((message: ScanProgressMessage) => {
      this.handleScanJobCreated(message);
    });
  }

  /**
   * Handle scan started notifications
   */
  private handleScanStarted(message: ScanProgressMessage): void {
    const scanJob = message.scanJob;
    const title = scanJob?.name || `Scan ${message.scanJobId}`;
    const scanPath = scanJob?.scanPath || 'Unknown path';
    
    this.notificationService.showScanProgress(
      message.scanJobId,
      `Started scanning: ${scanPath}`,
      0
    );
  }

  /**
   * Handle scan progress notifications
   */
  private handleScanProgress(message: ScanProgressMessage): void {
    const progress = message.progress?.progress || 0;
    const filesProcessed = message.progress?.filesProcessed || 0;
    const filesFound = message.progress?.filesFound || 0;
    const currentFile = message.progress?.currentFile;
    
    let progressMessage = `Processing ${filesProcessed} of ${filesFound} files (${Math.round(progress)}%)`;
    
    if (currentFile) {
      progressMessage += `\nCurrent: ${this.getFileName(currentFile)}`;
    }

    this.notificationService.showScanProgress(
      message.scanJobId,
      progressMessage,
      progress
    );
  }

  /**
   * Handle scan completed notifications
   */
  private handleScanCompleted(message: ScanProgressMessage): void {
    const scanJob = message.scanJob;
    const filesAdded = message.progress?.filesAdded || 0;
    const filesProcessed = message.progress?.filesProcessed || 0;
    const errors = message.progress?.errors || 0;
    
    const title = scanJob?.name || `Scan ${message.scanJobId}`;
    let completionMessage = `Scan completed successfully!\n`;
    completionMessage += `Files processed: ${filesProcessed}\n`;
    completionMessage += `New files added: ${filesAdded}`;
    
    if (errors > 0) {
      completionMessage += `\nErrors encountered: ${errors}`;
    }

    this.notificationService.showScanComplete(
      message.scanJobId,
      completionMessage,
      filesAdded
    );
  }

  /**
   * Handle scan failed notifications
   */
  private handleScanFailed(message: ScanProgressMessage): void {
    const scanJob = message.scanJob;
    const title = scanJob?.name || `Scan ${message.scanJobId}`;
    const errorMessage = message.errorMessage || message.message || 'Scan failed due to an unknown error';
    const filesProcessed = message.progress?.filesProcessed || 0;
    
    let failureMessage = `Scan failed: ${errorMessage}\n`;
    failureMessage += `Files processed before failure: ${filesProcessed}`;

    this.notificationService.showScanError(
      message.scanJobId,
      failureMessage,
      errorMessage
    );
  }

  /**
   * Handle scan cancelled notifications
   */
  private handleScanCancelled(message: ScanProgressMessage): void {
    const scanJob = message.scanJob;
    const title = scanJob?.name || `Scan ${message.scanJobId}`;
    const filesProcessed = message.progress?.filesProcessed || 0;
    
    let cancelMessage = `Scan was cancelled\n`;
    cancelMessage += `Files processed: ${filesProcessed}`;

    this.notificationService.showWarning(
      'Scan Cancelled',
      cancelMessage,
      8000 // Stay visible longer for cancelled scans
    );
  }

  /**
   * Handle scan job created notifications
   */
  private handleScanJobCreated(message: ScanProgressMessage): void {
    const scanJob = message.scanJob;
    const title = scanJob?.name || `New Scan Job ${message.scanJobId}`;
    const scanPath = scanJob?.scanPath || 'Unknown path';
    const platform = scanJob?.platform?.name || 'Auto-detect';
    
    this.notificationService.showInfo(
      'New Scan Job Created',
      `${title}\nPath: ${scanPath}\nPlatform: ${platform}`,
      6000
    );
  }

  /**
   * Extract filename from full path
   */
  private getFileName(filePath: string): string {
    if (!filePath) return '';
    const parts = filePath.split(/[\/\\]/);
    return parts[parts.length - 1] || filePath;
  }

  /**
   * Manually show a scan progress notification (for non-SignalR scenarios)
   */
  showManualScanProgress(scanJobId: number, message: string, progress?: number): void {
    this.notificationService.showScanProgress(scanJobId, message, progress);
  }

  /**
   * Manually show a scan completion notification
   */
  showManualScanComplete(scanJobId: number, message: string, filesAdded?: number): void {
    this.notificationService.showScanComplete(scanJobId, message, filesAdded);
  }

  /**
   * Manually show a scan error notification
   */
  showManualScanError(scanJobId: number, message: string, error?: string): void {
    this.notificationService.showScanError(scanJobId, message, error);
  }
}
