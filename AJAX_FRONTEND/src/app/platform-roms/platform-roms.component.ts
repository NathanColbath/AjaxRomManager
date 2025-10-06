import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PlatformsService } from '../services/platforms.service';
import { RomsService } from '../services/roms.service';
import { FileUploadService } from '../services/file-upload.service';
import { Rom, Platform, RomFilter } from '../models/rom.model';
import { RomCardComponent } from '../rom-card/rom-card.component';

@Component({
  selector: 'app-platform-roms',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RomCardComponent],
  templateUrl: './platform-roms.component.html',
  styleUrl: './platform-roms.component.scss'
})
export class PlatformRomsComponent implements OnInit {
  platform: Platform | null = null;
  roms: Rom[] = [];
  filteredRoms: Rom[] = [];
  
  // Search and filter properties
  searchTerm: string = '';
  sortBy: string = 'title';
  sortOrder: string = 'asc';
  
  loading = false;
  error: string | null = null;
  platformId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private platformsService: PlatformsService,
    private romsService: RomsService,
    private fileUploadService: FileUploadService
  ) {}

  ngOnInit(): void {
    // Get platform ID from route parameters
    this.route.params.subscribe(params => {
      this.platformId = +params['platformId'];
      if (this.platformId) {
        this.loadPlatformAndRoms();
      }
    });
  }

  loadPlatformAndRoms(): void {
    if (!this.platformId) return;

    this.loading = true;
    this.error = null;

    // Load platform and ROMs using the proper services
    this.loadPlatform();
    this.loadRoms();
  }

  loadPlatform(): void {
    if (!this.platformId) return;

    this.platformsService.getPlatformById(this.platformId).subscribe({
      next: (platform) => {
        this.platform = platform;
      },
      error: (error) => {
        console.error('Error loading platform:', error);
        this.error = 'Failed to load platform';
        this.loading = false;
      }
    });
  }

  loadRoms(): void {
    if (!this.platformId) return;

    const romFilter: RomFilter = {
      platformId: this.platformId,
      page: 1,
      pageSize: 100,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };

    this.romsService.getRoms(romFilter).subscribe({
      next: (result) => {
        this.roms = result.items || [];
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading ROMs:', error);
        this.error = 'Failed to load ROMs';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.roms];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchTerm = this.searchTerm.toLowerCase();
      filtered = filtered.filter(rom => 
        rom.title.toLowerCase().includes(searchTerm) ||
        (rom.fileName && rom.fileName.toLowerCase().includes(searchTerm))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'fileSize':
          comparison = (a.fileSize || 0) - (b.fileSize || 0);
          break;
        case 'dateAdded':
          comparison = a.dateAdded.getTime() - b.dateAdded.getTime();
          break;
      }
      
      return this.sortOrder === 'desc' ? -comparison : comparison;
    });

    this.filteredRoms = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.sortBy = 'title';
    this.sortOrder = 'asc';
    this.applyFilters();
  }

  goBackToPlatforms(): void {
    this.router.navigate(['/roms']);
  }

  // ========================================
  getPlatformLogoUrl(): string {
    return this.fileUploadService.getPlatformLogoUrl(this.platform?.iconPath || '');
  }

  refreshData(): void {
    this.loadPlatformAndRoms();
  }
}
