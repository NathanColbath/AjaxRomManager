import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService, apiRoutes } from '../services/api.service';
import { Rom, Platform } from '../models/rom.model';
import { mockPlatforms, mockRoms } from './roms-mockdata';

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
  
  // Search and filter properties
  searchTerm: string = '';
  statusFilter: string = '';
  sortBy: string = 'name';
  
  loading = false;
  error: string | null = null;

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    // ========================================
    // SWITCHING BETWEEN TEST DATA AND API
    // ========================================
    
    // FOR TEST DATA (current setup):
    this.loadTestData();
    
    // FOR REAL API (when backend is ready):
    // this.loadPlatforms();
    // this.loadRoms();
  }

  loadPlatforms(): void {
    this.loading = true;
    this.error = null;
    
    this.apiService.get<Platform[]>(apiRoutes.PLATFORMS).subscribe({
      next: (platforms) => {
        this.platforms = platforms;
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
    this.apiService.get<Rom[]>(apiRoutes.ROMS).subscribe({
      next: (roms) => {
        this.roms = roms;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading ROMs:', error);
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
          return this.getPlatformRomCount(b.id || 0) - this.getPlatformRomCount(a.id || 0);
        case 'created':
          return b.createdAt.getTime() - a.createdAt.getTime();
        default:
          return 0;
      }
    });

    // Add ROM count to each platform
    this.filteredPlatforms = filtered.map(platform => ({
      ...platform,
      romCount: this.getPlatformRomCount(platform.id || 0)
    } as PlatformWithRomCount));
  }

  getPlatformRomCount(platformId: number): number {
    return this.roms.filter(rom => rom.platformId === platformId).length;
  }

  getTotalRomCount(): number {
    return this.roms.length;
  }

  viewPlatformRoms(platform: Platform): void {
    console.log('Platform clicked:', platform);
    // Navigate to platform-specific ROM list
    if (platform.id) {
      this.router.navigate(['/roms/platform', platform.id]);
    }
  }

  // ========================================
  // TEST DATA METHOD - Remove when using real API
  // ========================================
  loadTestData(): void {
    this.loading = true;
    
    // Simulate API delay
    setTimeout(() => {
      // Use clean mock data
      this.platforms = mockPlatforms;
      this.roms = mockRoms;

      this.applyFilters();
      this.loading = false;
    }, 1000); // Simulate 1 second loading time
  }
}
