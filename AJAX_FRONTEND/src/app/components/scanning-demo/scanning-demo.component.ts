import { Component, OnInit, OnDestroy } from '@angular/core';
import { ScanningService } from '../services/scanning.service';
import { ScanningSignalRService } from '../services/scanning-signalr.service';
import { 
  ScanJob, 
  ScanProgress, 
  ScanConfiguration, 
  StartScanRequest, 
  ScanProgressMessage 
} from '../models/rom.model';

@Component({
  selector: 'app-scanning-demo',
  template: `
    <div class="scanning-demo">
      <h2>ROM Scanning Demo</h2>
      
      <!-- Connection Status -->
      <div class="connection-status" [ngClass]="isConnected ? 'connected' : 'disconnected'">
        <i class="fas fa-circle"></i> 
        {{ isConnected ? 'Connected' : 'Disconnected' }}
      </div>

      <!-- Scan Configuration -->
      <div class="scan-config">
        <h3>Scan Configuration</h3>
        <div class="form-group">
          <label for="directoryPath">Directory Path:</label>
          <input 
            id="directoryPath" 
            type="text" 
            [(ngModel)]="scanDirectory" 
            placeholder="C:\Roms"
            class="form-control">
        </div>
        
        <div class="form-group">
          <label for="platformId">Platform (Optional):</label>
          <select id="platformId" [(ngModel)]="selectedPlatformId" class="form-control">
            <option value="">Auto-detect</option>
            <option value="1">Nintendo Entertainment System</option>
            <option value="2">Super Nintendo</option>
            <option value="3">Sega Genesis</option>
            <option value="4">PlayStation</option>
          </select>
        </div>

        <div class="scan-options">
          <h4>Scan Options</h4>
          <div class="checkbox-group">
            <label>
              <input type="checkbox" [(ngModel)]="scanOptions.recursive"> Recursive
            </label>
            <label>
              <input type="checkbox" [(ngModel)]="scanOptions.autoDetectPlatform"> Auto-detect Platform
            </label>
            <label>
              <input type="checkbox" [(ngModel)]="scanOptions.createMetadata"> Create Metadata
            </label>
            <label>
              <input type="checkbox" [(ngModel)]="scanOptions.skipDuplicates"> Skip Duplicates
            </label>
          </div>
        </div>

        <div class="button-group">
          <button 
            (click)="startScan()" 
            [disabled]="!scanDirectory || isScanning"
            class="btn btn-primary">
            {{ isScanning ? 'Scanning...' : 'Start Scan' }}
          </button>
          
          <button 
            (click)="startRecurringScan()" 
            [disabled]="!scanDirectory || isScanning"
            class="btn btn-secondary">
            Start Daily Scan
          </button>
          
          <button 
            (click)="stopCurrentScan()" 
            [disabled]="!currentScanJob"
            class="btn btn-danger">
            Stop Scan
          </button>
        </div>
      </div>

      <!-- Current Scan Progress -->
      <div *ngIf="currentScanJob" class="current-scan">
        <h3>Current Scan: {{ currentScanJob.name }}</h3>
        
        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="currentProgress"></div>
        </div>
        
        <div class="progress-text">
          {{ currentProgress | number:'1.1-1' }}% Complete
        </div>
        
        <div class="scan-details">
          <div class="detail-row">
            <span class="label">Status:</span>
            <span class="value" [ngClass]="currentScanJob.status.toLowerCase()">
              {{ currentScanJob.status }}
            </span>
          </div>
          <div class="detail-row">
            <span class="label">Files Found:</span>
            <span class="value">{{ currentScanJob.filesFound }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Files Processed:</span>
            <span class="value">{{ currentScanJob.filesProcessed }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Errors:</span>
            <span class="value">{{ currentScanJob.errors }}</span>
          </div>
        </div>

        <div *ngIf="currentProgress > 0 && currentProgress < 100" class="time-info">
          <div *ngIf="estimatedCompletion">
            <span class="label">Estimated Completion:</span>
            <span class="value">{{ estimatedCompletion | date:'short' }}</span>
          </div>
        </div>
      </div>

      <!-- Recent Messages -->
      <div *ngIf="recentMessages.length > 0" class="recent-messages">
        <h3>Recent Messages</h3>
        <div class="message-list">
          <div 
            *ngFor="let message of recentMessages" 
            class="message-item" 
            [ngClass]="message.status.toLowerCase()">
            <span class="timestamp">{{ message.timestamp | date:'short' }}</span>
            <span class="message">{{ message.message }}</span>
          </div>
        </div>
      </div>

      <!-- Scan History -->
      <div class="scan-history">
        <h3>Scan History</h3>
        <button (click)="loadScanHistory()" class="btn btn-outline-primary">
          Load History
        </button>
        
        <div *ngIf="scanHistory.length > 0" class="history-list">
          <div *ngFor="let scan of scanHistory" class="history-item">
            <div class="history-header">
              <span class="scan-name">{{ scan.name }}</span>
              <span class="scan-status" [ngClass]="scan.status.toLowerCase()">
                {{ scan.status }}
              </span>
            </div>
            <div class="history-details">
              <span>{{ scan.scanPath }}</span>
              <span>{{ scan.createdAt | date:'short' }}</span>
              <span *ngIf="scan.completedAt">
                Completed: {{ scan.completedAt | date:'short' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .scanning-demo {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .connection-status {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;
      padding: 8px 12px;
      border-radius: 4px;
      font-weight: bold;
    }

    .connection-status.connected {
      background-color: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .connection-status.disconnected {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .scan-config {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .form-group {
      margin-bottom: 15px;
    }

    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ced4da;
      border-radius: 4px;
    }

    .checkbox-group {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
      margin-top: 10px;
    }

    .checkbox-group label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: normal;
    }

    .button-group {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }

    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-danger {
      background-color: #dc3545;
      color: white;
    }

    .btn-outline-primary {
      background-color: transparent;
      color: #007bff;
      border: 1px solid #007bff;
    }

    .current-scan {
      background: #e7f3ff;
      border: 1px solid #b3d9ff;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .progress-bar {
      width: 100%;
      height: 20px;
      background-color: #e9ecef;
      border-radius: 10px;
      overflow: hidden;
      margin: 10px 0;
    }

    .progress-fill {
      height: 100%;
      background-color: #007bff;
      transition: width 0.3s ease;
    }

    .progress-text {
      text-align: center;
      font-weight: bold;
      margin-bottom: 15px;
    }

    .scan-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 10px;
      margin-bottom: 15px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
    }

    .label {
      font-weight: 500;
      color: #6c757d;
    }

    .value {
      font-weight: bold;
    }

    .value.running {
      color: #007bff;
    }

    .value.completed {
      color: #28a745;
    }

    .value.failed {
      color: #dc3545;
    }

    .value.cancelled {
      color: #ffc107;
    }

    .recent-messages {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
    }

    .message-list {
      max-height: 200px;
      overflow-y: auto;
    }

    .message-item {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      border-bottom: 1px solid #dee2e6;
    }

    .message-item:last-child {
      border-bottom: none;
    }

    .message-item.started {
      color: #007bff;
    }

    .message-item.completed {
      color: #28a745;
    }

    .message-item.failed {
      color: #dc3545;
    }

    .message-item.cancelled {
      color: #ffc107;
    }

    .timestamp {
      font-size: 0.9em;
      color: #6c757d;
    }

    .scan-history {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 15px;
    }

    .history-list {
      margin-top: 15px;
    }

    .history-item {
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      padding: 10px;
      margin-bottom: 10px;
    }

    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 5px;
    }

    .scan-name {
      font-weight: bold;
    }

    .scan-status {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.8em;
      font-weight: bold;
    }

    .scan-status.running {
      background-color: #cce5ff;
      color: #004085;
    }

    .scan-status.completed {
      background-color: #d4edda;
      color: #155724;
    }

    .scan-status.failed {
      background-color: #f8d7da;
      color: #721c24;
    }

    .scan-status.cancelled {
      background-color: #fff3cd;
      color: #856404;
    }

    .history-details {
      display: flex;
      gap: 15px;
      font-size: 0.9em;
      color: #6c757d;
    }
  `]
})
export class ScanningDemoComponent implements OnInit, OnDestroy {
  isConnected = false;
  isScanning = false;
  scanDirectory = 'C:\\Roms';
  selectedPlatformId: number | undefined;
  currentScanJob: ScanJob | null = null;
  currentProgress = 0;
  estimatedCompletion: Date | null = null;
  recentMessages: ScanProgressMessage[] = [];
  scanHistory: ScanJob[] = [];

  scanOptions = {
    recursive: true,
    autoDetectPlatform: true,
    createMetadata: true,
    skipDuplicates: true
  };

  constructor(
    private scanningService: ScanningService,
    private signalRService: ScanningSignalRService
  ) {}

  async ngOnInit() {
    try {
      await this.signalRService.startConnection();
      this.isConnected = true;
      
      // Join the all scans group to receive all scan notifications
      await this.signalRService.joinAllScansGroup();
      
      this.setupEventHandlers();
      await this.loadScanHistory();
    } catch (error) {
      console.error('Failed to start SignalR connection:', error);
      this.isConnected = false;
    }
  }

  async ngOnDestroy() {
    await this.signalRService.stopConnection();
  }

  private setupEventHandlers() {
    // Handle scan started
    this.signalRService.onScanStarted((message: ScanProgressMessage) => {
      this.currentScanJob = message.scanJob || null;
      this.currentProgress = 0;
      this.isScanning = true;
      this.addRecentMessage(message);
    });

    // Handle scan progress updates
    this.signalRService.onScanProgress((message: ScanProgressMessage) => {
      if (this.currentScanJob && this.currentScanJob.id === message.scanJobId) {
        this.currentProgress = message.progress?.progress || 0;
        this.estimatedCompletion = message.progress?.estimatedCompletion || null;
      }
    });

    // Handle scan completed
    this.signalRService.onScanCompleted((message: ScanProgressMessage) => {
      if (this.currentScanJob && this.currentScanJob.id === message.scanJobId) {
        this.currentScanJob = message.scanJob || null;
        this.currentProgress = 100;
        this.isScanning = false;
        this.addRecentMessage(message);
        
        // Reload scan history
        this.loadScanHistory();
        
        // Clear current scan after a delay
        setTimeout(() => {
          this.currentScanJob = null;
          this.currentProgress = 0;
        }, 5000);
      }
    });

    // Handle scan failed
    this.signalRService.onScanFailed((message: ScanProgressMessage) => {
      if (this.currentScanJob && this.currentScanJob.id === message.scanJobId) {
        this.currentScanJob = message.scanJob || null;
        this.isScanning = false;
        this.addRecentMessage(message);
        
        // Clear current scan after a delay
        setTimeout(() => {
          this.currentScanJob = null;
          this.currentProgress = 0;
        }, 10000);
      }
    });

    // Handle scan cancelled
    this.signalRService.onScanCancelled((message: ScanProgressMessage) => {
      if (this.currentScanJob && this.currentScanJob.id === message.scanJobId) {
        this.currentScanJob = message.scanJob || null;
        this.isScanning = false;
        this.addRecentMessage(message);
        
        // Clear current scan after a delay
        setTimeout(() => {
          this.currentScanJob = null;
          this.currentProgress = 0;
        }, 3000);
      }
    });

    // Handle new scan job created
    this.signalRService.onScanJobCreated((message: ScanProgressMessage) => {
      this.addRecentMessage(message);
    });
  }

  private addRecentMessage(message: ScanProgressMessage) {
    this.recentMessages.unshift(message);
    
    // Keep only the last 10 messages
    if (this.recentMessages.length > 10) {
      this.recentMessages = this.recentMessages.slice(0, 10);
    }
  }

  async startScan() {
    if (!this.scanDirectory) return;

    try {
      const request = new StartScanRequest({
        directoryPath: this.scanDirectory,
        platformId: this.selectedPlatformId,
        options: {
          recursive: this.scanOptions.recursive,
          autoDetectPlatform: this.scanOptions.autoDetectPlatform,
          createMetadata: this.scanOptions.createMetadata,
          skipDuplicates: this.scanOptions.skipDuplicates
        }
      });

      const scanJob = await this.scanningService.startScan(request).toPromise();
      this.currentScanJob = scanJob;
      this.isScanning = true;
      
      // Join the specific scan group for detailed updates
      await this.signalRService.joinScanGroup(scanJob.id!);
      
    } catch (error) {
      console.error('Failed to start scan:', error);
      alert('Failed to start scan. Please check the directory path and try again.');
    }
  }

  async startRecurringScan() {
    if (!this.scanDirectory) return;

    try {
      const scanJob = await this.scanningService.startDailyScan(
        this.scanDirectory, 
        this.selectedPlatformId
      ).toPromise();
      
      this.addRecentMessage({
        scanJobId: scanJob.id!,
        status: 'Created',
        message: `Recurring scan created: ${scanJob.name}`,
        timestamp: new Date().toISOString(),
        scanJob: scanJob
      });
      
    } catch (error) {
      console.error('Failed to start recurring scan:', error);
      alert('Failed to start recurring scan. Please check the directory path and try again.');
    }
  }

  async stopCurrentScan() {
    if (!this.currentScanJob) return;

    try {
      await this.scanningService.stopScan(this.currentScanJob.id!).toPromise();
    } catch (error) {
      console.error('Failed to stop scan:', error);
      alert('Failed to stop scan.');
    }
  }

  async loadScanHistory() {
    try {
      const result = await this.scanningService.getScanHistoryPage(1, 10).toPromise();
      this.scanHistory = result?.items || [];
    } catch (error) {
      console.error('Failed to load scan history:', error);
    }
  }
}
