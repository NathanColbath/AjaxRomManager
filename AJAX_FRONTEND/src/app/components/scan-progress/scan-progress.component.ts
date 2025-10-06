import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScanJob, ScanProgress } from '../../models/rom.model';

@Component({
  selector: 'app-scan-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="scan-progress-card" [ngClass]="getStatusClass()">
      <div class="scan-header" *ngIf="showHeader">
        <div class="scan-info">
          <h3>{{ scanJob?.name || 'Unnamed Scan' }}</h3>
          <div class="scan-path">{{ scanJob?.scanPath }}</div>
        </div>
        <div class="scan-status" [ngClass]="getStatusClass()">
          {{ scanJob?.status || 'Unknown' }}
        </div>
      </div>

      <div class="progress-section" *ngIf="showProgress">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            [style.width.%]="getProgressPercentage()"
            [ngClass]="getProgressClass()">
          </div>
        </div>
        <div class="progress-text">
          {{ getProgressPercentage() }}% Complete
          <span *ngIf="progress?.currentFile" class="current-file">
            - Processing: {{ progress.currentFile }}
          </span>
        </div>
      </div>

      <div class="scan-stats" *ngIf="showStats">
        <div class="stat-item">
          <span class="stat-label">Found:</span>
          <span class="stat-value">{{ scanJob?.filesFound || 0 }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Processed:</span>
          <span class="stat-value">{{ scanJob?.filesProcessed || 0 }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Added:</span>
          <span class="stat-value">{{ (scanJob?.filesProcessed || 0) - (scanJob?.errors || 0) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Errors:</span>
          <span class="stat-value error">{{ scanJob?.errors || 0 }}</span>
        </div>
      </div>

      <div class="time-info" *ngIf="showTimeInfo && progress">
        <div class="time-item" *ngIf="progress.elapsedTime">
          <span class="time-label">Elapsed:</span>
          <span class="time-value">{{ progress.elapsedTime }}</span>
        </div>
        <div class="time-item" *ngIf="progress.remainingTime">
          <span class="time-label">Remaining:</span>
          <span class="time-value">{{ progress.remainingTime }}</span>
        </div>
        <div class="time-item" *ngIf="progress.estimatedCompletion">
          <span class="time-label">ETA:</span>
          <span class="time-value">{{ formatDate(progress.estimatedCompletion) }}</span>
        </div>
      </div>

      <div class="scan-actions" *ngIf="showActions && scanJob">
        <ng-content select="[slot=actions]"></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .scan-progress-card {
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      transition: box-shadow 0.2s ease;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      &.running {
        border-left: 4px solid #3498db;
        box-shadow: 0 2px 8px rgba(52, 152, 219, 0.1);
      }

      &.completed {
        border-left: 4px solid #28a745;
        box-shadow: 0 2px 8px rgba(40, 167, 69, 0.1);
      }

      &.failed {
        border-left: 4px solid #dc3545;
        box-shadow: 0 2px 8px rgba(220, 53, 69, 0.1);
      }

      &.cancelled {
        border-left: 4px solid #ffc107;
        box-shadow: 0 2px 8px rgba(255, 193, 7, 0.1);
      }
    }

    .scan-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;

      .scan-info {
        flex: 1;

        h3 {
          margin: 0 0 8px 0;
          color: #2c3e50;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .scan-path {
          color: #6c757d;
          font-size: 0.9rem;
          font-family: 'Courier New', monospace;
        }
      }

      .scan-status {
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;

        &.running {
          background: #cce5ff;
          color: #004085;
        }

        &.completed {
          background: #d4edda;
          color: #155724;
        }

        &.failed {
          background: #f8d7da;
          color: #721c24;
        }

        &.cancelled {
          background: #fff3cd;
          color: #856404;
        }
      }
    }

    .progress-section {
      margin-bottom: 20px;

      .progress-bar {
        width: 100%;
        height: 8px;
        background: #e9ecef;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 8px;
      }

      .progress-fill {
        height: 100%;
        transition: width 0.3s ease;

        &.running {
          background: linear-gradient(90deg, #3498db, #2ecc71);
        }

        &.completed {
          background: #28a745;
        }

        &.failed {
          background: #dc3545;
        }

        &.cancelled {
          background: #ffc107;
        }
      }

      .progress-text {
        text-align: center;
        font-weight: 600;
        color: #495057;
        font-size: 0.9rem;

        .current-file {
          display: block;
          font-weight: normal;
          color: #6c757d;
          font-size: 0.8rem;
          margin-top: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }

    .scan-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;

        .stat-label {
          font-size: 0.8rem;
          color: #6c757d;
          margin-bottom: 4px;
          font-weight: 500;
        }

        .stat-value {
          font-size: 1.1rem;
          font-weight: 700;
          color: #495057;

          &.error {
            color: #dc3545;
          }
        }
      }
    }

    .time-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;

      .time-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;

        .time-label {
          font-size: 0.8rem;
          color: #6c757d;
          margin-bottom: 4px;
          font-weight: 500;
        }

        .time-value {
          font-size: 0.9rem;
          font-weight: 600;
          color: #495057;
        }
      }
    }

    .scan-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      padding-top: 15px;
      border-top: 1px solid #e9ecef;
    }

    // Responsive design
    @media (max-width: 768px) {
      .scan-header {
        flex-direction: column;
        gap: 15px;
        align-items: flex-start;
      }

      .scan-stats {
        grid-template-columns: repeat(2, 1fr);
      }

      .time-info {
        grid-template-columns: 1fr;
      }

      .scan-actions {
        flex-direction: column;
      }
    }
  `]
})
export class ScanProgressComponent implements OnChanges {
  @Input() scanJob: ScanJob | null = null;
  @Input() progress: ScanProgress | null = null;
  @Input() showHeader: boolean = true;
  @Input() showProgress: boolean = true;
  @Input() showStats: boolean = true;
  @Input() showTimeInfo: boolean = true;
  @Input() showActions: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    // Handle changes if needed
  }

  getStatusClass(): string {
    return (this.scanJob?.status || 'unknown').toLowerCase();
  }

  getProgressClass(): string {
    return this.getStatusClass();
  }

  getProgressPercentage(): number {
    if (!this.scanJob?.filesFound || this.scanJob.filesFound === 0) {
      return 0;
    }
    return Math.round((this.scanJob.filesProcessed / this.scanJob.filesFound) * 100);
  }

  formatDate(date: Date | string): string {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleString();
  }
}
