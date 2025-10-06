import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { RomsService } from '../services/roms.service';
import { PlatformsService } from '../services/platforms.service';
import { FileUploadService } from '../services/file-upload.service';
import { Rom, Platform, RomFilter } from '../models/rom.model';

interface PlatformWithRomCount extends Platform {
  romCount: number;
}

@Component({
  selector: 'app-roms',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './roms.component.html',
  styleUrl: './roms.component.scss'
})
export class RomsComponent implements OnInit {
  platforms: Platform[] = [];
  filteredPlatforms: PlatformWithRomCount[] = [];
  roms: Rom[] = [];
  platformRomCounts: { [key: number]: number } = {};
  
  // Search and filter properties
  searchTerm: string = '';
  statusFilter: string = '';
  sortBy: string = 'name';
  
  loading = false;
  error: string | null = null;

  // Filter object for API calls
  romFilter: RomFilter = {
    page: 1,
    pageSize: 20,
    sortBy: 'name',
    sortOrder: 'asc'
  };

  constructor(
    private romsService: RomsService, 
    private platformsService: PlatformsService, 
    private fileUploadService: FileUploadService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPlatforms();
    this.loadRoms();
  }

  loadPlatforms(): void {
    this.loading = true;
    this.error = null;
    
    this.platformsService.getPlatformsWithRomCounts().subscribe({
      next: (platformsWithCounts) => {
        // Convert the API response to our interface and store ROM counts
        this.platforms = platformsWithCounts.map(p => {
          this.platformRomCounts[p.id] = p.romCount;
          const platform = new Platform();
          platform.id = p.id;
          platform.name = p.name;
          platform.description = p.description;
          platform.extension = p.extension;
          platform.extensions = p.extensions;
          platform.emulatorPath = p.emulatorPath;
          platform.emulatorArguments = p.emulatorArguments;
          platform.iconPath = p.iconPath;
          platform.isActive = p.isActive;
          platform.createdAt = new Date(p.createdAt);
          platform.roms = [];
          platform.scanJobs = [];
          return platform;
        });
        
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading platforms:', error);
        this.error = 'Failed to load platforms';
        this.loading = false;
      }
    });
  }

  loadRoms(): void {
    this.loading = true;
    this.error = null;
    
    // Update filter with current search term
    this.romFilter.searchTerm = this.searchTerm;
    this.romFilter.sortBy = this.sortBy;
    
    this.romsService.getRoms(this.romFilter).subscribe({
      next: (result) => {
        this.roms = result.items;
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
    let filtered = [...this.platforms];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(platform => 
        platform.name.toLowerCase().includes(searchLower) ||
        (platform.extension && platform.extension.toLowerCase().includes(searchLower))
      );
    }

    // Apply status filter
    if (this.statusFilter) {
      filtered = filtered.filter(platform => 
        this.statusFilter === 'active' ? platform.isActive : !platform.isActive
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'romCount':
          return (this.platformRomCounts[b.id || 0] || 0) - (this.platformRomCounts[a.id || 0] || 0);
        case 'created':
          return b.createdAt.getTime() - a.createdAt.getTime();
        default:
          return 0;
      }
    });

    // Add ROM count to each platform
    this.filteredPlatforms = filtered.map(platform => ({
      ...platform,
      romCount: this.platformRomCounts[platform.id || 0] || 0
    } as PlatformWithRomCount));
  }

  getPlatformRomCount(platformId: number): number {
    return this.platformRomCounts[platformId] || 0;
  }

  getTotalRomCount(): number {
    return this.roms?.length || 0;
  }

  viewPlatformRoms(platform: Platform): void {
    console.log('Platform clicked:', platform);
    // Navigate to platform-specific ROM list
    if (platform.id) {
      this.router.navigate(['/roms/platform', platform.id]);
    }
  }

  onSearch(): void {
    this.loadRoms();
  }

  onSortChange(): void {
    this.loadRoms();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  refreshData(): void {
    this.loadPlatforms();
    this.loadRoms();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.sortBy = 'name';
    this.romFilter = {
      page: 1,
      pageSize: 20,
      sortBy: 'name',
      sortOrder: 'asc'
    };
    this.loadRoms();
  }

  getPlatformLogoUrl(platform: Platform): string {
    return this.fileUploadService.getPlatformLogoUrl(platform.iconPath || '');
  }
}
