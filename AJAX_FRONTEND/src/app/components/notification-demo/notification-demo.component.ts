import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification-demo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-demo">
      <h5>Notification System Demo</h5>
      <div class="demo-buttons">
        <button class="btn btn-success me-2" (click)="showSuccess()">Success</button>
        <button class="btn btn-danger me-2" (click)="showError()">Error</button>
        <button class="btn btn-warning me-2" (click)="showWarning()">Warning</button>
        <button class="btn btn-info me-2" (click)="showInfo()">Info</button>
        <button class="btn btn-primary me-2" (click)="showScanProgress()">Scan Progress</button>
        <button class="btn btn-secondary me-2" (click)="showScanComplete()">Scan Complete</button>
        <button class="btn btn-dark" (click)="showMultiple()">Multiple</button>
      </div>
    </div>
  `,
  styles: [`
    .notification-demo {
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      margin: 1rem 0;
    }
    
    .demo-buttons {
      margin-top: 1rem;
    }
    
    .btn {
      margin-bottom: 0.5rem;
    }
  `]
})
export class NotificationDemoComponent {
  constructor(private notificationService: NotificationService) {}

  showSuccess(): void {
    this.notificationService.showSuccess(
      'Operation Successful',
      'Your ROM scan has completed successfully!',
      4000
    );
  }

  showError(): void {
    this.notificationService.showError(
      'Scan Failed',
      'Failed to scan directory: Access denied',
      6000
    );
  }

  showWarning(): void {
    this.notificationService.showWarning(
      'Low Disk Space',
      'You have less than 1GB of free disk space remaining',
      5000
    );
  }

  showInfo(): void {
    this.notificationService.showInfo(
      'New ROMs Detected',
      'Found 15 new ROM files in your scan directory',
      4000
    );
  }

  showScanProgress(): void {
    const scanJobId = Math.floor(Math.random() * 1000);
    this.notificationService.showScanProgress(
      scanJobId,
      'Scanning Nintendo 64 ROMs...\nCurrent: Super Mario 64.n64',
      45
    );
  }

  showScanComplete(): void {
    const scanJobId = Math.floor(Math.random() * 1000);
    this.notificationService.showScanComplete(
      scanJobId,
      'Scan completed successfully!\nFiles processed: 25\nNew files added: 8',
      12
    );
  }

  showMultiple(): void {
    // Show multiple notifications to test the system
    this.notificationService.showInfo('Info', 'First notification', 3000);
    setTimeout(() => {
      this.notificationService.showWarning('Warning', 'Second notification', 3000);
    }, 500);
    setTimeout(() => {
      this.notificationService.showError('Error', 'Third notification', 3000);
    }, 1000);
  }
}
