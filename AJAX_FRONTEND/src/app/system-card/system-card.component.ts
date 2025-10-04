import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameSystem } from '../models/rom.model';

@Component({
  selector: 'app-system-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './system-card.component.html',
  styleUrl: './system-card.component.scss'
})
export class SystemCardComponent {
  @Input() system!: GameSystem;

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString();
  }
}
