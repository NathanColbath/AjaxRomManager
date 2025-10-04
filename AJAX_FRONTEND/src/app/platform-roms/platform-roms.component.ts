import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService, apiRoutes } from '../services/api.service';
import { Rom, Platform } from '../models/rom.model';
import { RomCardComponent } from '../rom-card/rom-card.component';
import { mockPlatforms, mockRoms } from '../roms/roms-mockdata';

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
    private apiService: ApiService
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

    // ========================================
    // SWITCHING BETWEEN TEST DATA AND API
    // ========================================
    
    // FOR TEST DATA (current setup):
    this.loadTestData();
    
    // FOR REAL API (when backend is ready):
    // this.loadPlatform();
    // this.loadRoms();
  }

  loadPlatform(): void {
    if (!this.platformId) return;

    this.apiService.get<Platform>(`${apiRoutes.PLATFORMS}/${this.platformId}`).subscribe({
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

    this.apiService.get<Rom[]>(`${apiRoutes.ROMS}?platformId=${this.platformId}`).subscribe({
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
        case 'playCount':
          comparison = a.playCount - b.playCount;
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
  // TEST DATA METHOD - Remove when using real API
  // ========================================
  loadTestData(): void {
    // Simulate API delay
    setTimeout(() => {
      // Find platform by ID
      this.platform = mockPlatforms.find(p => p.id === this.platformId) || null;
      
      if (!this.platform) {
        this.error = 'Platform not found';
        this.loading = false;
        return;
      }

      // Filter ROMs by platform
      this.roms = mockRoms.filter(rom => rom.platformId === this.platformId);
      
      this.applyFilters();
      this.loading = false;
    }, 1000); // Simulate 1 second loading time
  }
}
