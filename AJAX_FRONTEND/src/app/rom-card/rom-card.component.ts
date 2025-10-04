import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Rom } from '../models/rom.model';

@Component({
  selector: 'rom-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rom-card.component.html',
  styleUrl: './rom-card.component.scss'
})
export class RomCardComponent {
  @Input() rom: Rom | undefined = undefined;

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
    if (this.rom) {
      this.rom.isFavorite = !this.rom.isFavorite;
    }
  }

  onPlay(): void {
    if (!this.rom) return;
    console.log('Playing ROM:', this.rom.title);
    // TODO: Implement play functionality
  }

  onDetails(): void {
    if (!this.rom) return;
    console.log('Showing details for ROM:', this.rom.title);
    // TODO: Implement details functionality
  }

  onDelete(): void {
    if (!this.rom) return;
    console.log('Deleting ROM:', this.rom.title);
    // TODO: Implement delete functionality
  }
}


