import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, apiRoutes } from '../services/api.service';
import { Rom, Platform, RomFilter } from '../models/rom.model';
import { RomCardComponent } from '../rom-card/rom-card.component';
import { mockPlatforms, mockRoms } from './roms-mockdata';


@Component({
  selector: 'app-roms',
  standalone: true,
  imports: [CommonModule, FormsModule, RomCardComponent],
  templateUrl: './roms.component.html',
  styleUrl: './roms.component.scss'
})
export class RomsComponent implements OnInit {
  roms: Rom[] = [];
  filteredRoms: Rom[] = [];
  platforms: Platform[] = [];
  filter: RomFilter = {
    searchTerm: '',
    sortBy: 'title',
    sortOrder: 'asc'
  };
  loading = false;
  error: string | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    // ========================================
    // SWITCHING BETWEEN TEST DATA AND API
    // ========================================
    
    // FOR TEST DATA (current setup):
    this.loadTestData();
    
    // FOR REAL API (when backend is ready):
    // this.loadRoms();
    // this.loadPlatforms();
  }

  loadRoms(): void {
    this.loading = true;
    this.error = null;
    
    this.apiService.get<Rom[]>(apiRoutes.ROMS).subscribe({
      next: (roms) => {
        this.roms = roms;
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

  loadPlatforms(): void {
    this.apiService.get<Platform[]>(apiRoutes.PLATFORMS).subscribe({
      next: (platforms) => {
        this.platforms = platforms;
      },
      error: (error) => {
        console.error('Error loading platforms:', error);
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.roms];

    // Apply search filter
    if (this.filter.searchTerm?.trim()) {
      const searchTerm = this.filter.searchTerm.toLowerCase();
      filtered = filtered.filter(rom => 
        rom.title.toLowerCase().includes(searchTerm) ||
        (rom.fileName && rom.fileName.toLowerCase().includes(searchTerm))
      );
    }

    // Apply platform filter
    if (this.filter.platformId) {
      filtered = filtered.filter(rom => rom.platformId === this.filter.platformId);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (this.filter.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'fileSize':
          comparison = (a.fileSize || 0) - (b.fileSize || 0);
          break;
        case 'releaseDate':
          const dateA = a.metadata?.releaseDate ? new Date(a.metadata.releaseDate).getTime() : 0;
          const dateB = b.metadata?.releaseDate ? new Date(b.metadata.releaseDate).getTime() : 0;
          comparison = dateA - dateB;
          break;
      }
      
      return this.filter.sortOrder === 'desc' ? -comparison : comparison;
    });

    this.filteredRoms = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  onPlatformFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.filter = {
      searchTerm: '',
      sortBy: 'name',
      sortOrder: 'asc'
    };
    this.applyFilters();
  }

  

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString();
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
