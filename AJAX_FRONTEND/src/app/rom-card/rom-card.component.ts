import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Rom } from '../models/rom.model';
import { RomsService } from '../services/roms.service';
import { DownloadService } from '../services/download.service';
import { NotificationService } from '../services/notification.service';
import { ModalService } from '../services/modal.service';

@Component({
  selector: 'rom-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rom-card.component.html',
  styleUrl: './rom-card.component.scss'
})
export class RomCardComponent {
  @Input() rom: Rom | undefined = undefined;
  @Output() romUpdated = new EventEmitter<Rom>();
  @Output() romDeleted = new EventEmitter<number>();

  isDownloading = false;

  constructor(
    private romsService: RomsService,
    private downloadService: DownloadService,
    private notificationService: NotificationService,
    private modalService: ModalService
  ) {}

  formatFileSize(bytes: number | undefined): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString();
  }

  onFavoriteToggle(): void {
    if (!this.rom?.id) return;
    
    this.romsService.toggleFavorite(this.rom.id).subscribe({
      next: (updatedRom) => {
        this.rom = updatedRom;
        this.romUpdated.emit(updatedRom);
      },
      error: (error) => {
        console.error('Error toggling favorite:', error);
        // Revert the change on error
        if (this.rom) {
          this.rom.isFavorite = !this.rom.isFavorite;
        }
      }
    });
  }

  onView(): void {
    if (!this.rom) return;
    console.log('Viewing ROM:', this.rom.title);
    // TODO: Implement play functionality
  }

  onDetails(): void {
    if (!this.rom) return;
    console.log('Showing details for ROM:', this.rom.title);
    // TODO: Implement details functionality
  }

  onDelete(): void {
    if (!this.rom?.id) return;
    
    this.modalService.showConfirm(
      'Delete ROM',
      `Are you sure you want to delete "${this.rom.title}"?`,
      'Delete',
      'Cancel'
    ).subscribe(result => {
      if (result.confirmed && this.rom?.id) {
        this.romsService.deleteRom(this.rom.id).subscribe({
          next: () => {
            this.romDeleted.emit(this.rom!.id);
          },
          error: (error) => {
            console.error('Error deleting ROM:', error);
            this.modalService.showError(
              'Delete Failed',
              'Failed to delete ROM. Please try again.'
            );
          }
        });
      }
    });
  }

  onArchive(): void {
    if (!this.rom?.id) return;
    
    this.romsService.toggleArchive(this.rom.id).subscribe({
      next: (updatedRom) => {
        this.rom = updatedRom;
        this.romUpdated.emit(updatedRom);
      },
      error: (error) => {
        console.error('Error toggling archive:', error);
        // Revert the change on error
        if (this.rom) {
          this.rom.isArchived = !this.rom.isArchived;
        }
      }
    });
  }

  onDownload(): void {
    if (!this.rom?.id) return;
    
    this.isDownloading = true;
    
    const fileName = this.rom.fileName || `${this.rom.title}.rom`;
    
    this.downloadService.initiateDownload(this.rom.id, fileName)
      .then(() => {
        this.notificationService.showSuccess(
          'Download Started',
          `Downloading ${fileName} to your default download folder.`
        );
      })
      .catch((error) => {
        console.error('Download failed:', error);
        this.notificationService.showError(
          'Download Failed',
          'Failed to download ROM. Please try again.'
        );
      })
      .finally(() => {
        this.isDownloading = false;
      });
  }
}


