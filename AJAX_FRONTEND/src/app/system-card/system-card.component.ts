import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Platform } from '../models/rom.model';
import { FileUploadService } from '../services/file-upload.service';

@Component({
  selector: 'app-system-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './system-card.component.html',
  styleUrl: './system-card.component.scss'
})
export class SystemCardComponent {
  @Input() system!: Platform;

  constructor(private fileUploadService: FileUploadService) {}

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString();
  }

  getPlatformLogoUrl(): string {
    return this.fileUploadService.getPlatformLogoUrl(this.system.iconPath || '');
  }
}
