import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, apiRoutes } from '../services/api.service';
import { GameSystem, SystemFilter } from '../models/rom.model';
import { SystemCardComponent } from '../system-card/system-card.component';

@Component({
  selector: 'app-systems',
  standalone: true,
  imports: [CommonModule, FormsModule, SystemCardComponent],
  templateUrl: './systems.component.html',
  styleUrl: './systems.component.scss'
})
export class SystemsComponent implements OnInit {
  systems: GameSystem[] = [];
  filteredSystems: GameSystem[] = [];
  filter: SystemFilter = {
    searchTerm: '',
    sortBy: 'name',
    sortOrder: 'asc'
  };
  loading = false;
  error: string | null = null;
  viewMode: 'grid' | 'list' = 'grid';

  get activeSystemsCount(): number {
    return this.systems.filter(s => s.isActive).length;
  }

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    // ========================================
    // SWITCHING BETWEEN TEST DATA AND API
    // ========================================
    
    // FOR TEST DATA (current setup):
    this.loadTestData();
    
    // FOR REAL API (when backend is ready):
    // this.loadSystems();
  }

  loadSystems(): void {
    this.loading = true;
    this.error = null;
    
    this.apiService.get<GameSystem[]>(apiRoutes.SYSTEMS).subscribe({
      next: (systems) => {
        this.systems = systems;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading systems:', error);
        this.error = 'Failed to load game systems';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.systems];

    // Apply search filter
    if (this.filter.searchTerm.trim()) {
      const searchTerm = this.filter.searchTerm.toLowerCase();
      filtered = filtered.filter(system => 
        system.name.toLowerCase().includes(searchTerm) ||
        system.extension?.toLowerCase().includes(searchTerm) ||
        system.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply active filter
    if (this.filter.isActive !== undefined) {
      filtered = filtered.filter(system => system.isActive === this.filter.isActive);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (this.filter.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'romCount':
          comparison = (a.romCount || 0) - (b.romCount || 0);
          break;
        case 'createdAt':
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          comparison = dateA - dateB;
          break;
      }
      
      return this.filter.sortOrder === 'desc' ? -comparison : comparison;
    });

    this.filteredSystems = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onSortChange(): void {
    this.applyFilters();
  }

  onActiveFilterChange(): void {
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

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  toggleSystemStatus(system: GameSystem): void {
    // In real implementation, this would call the API
    system.isActive = !system.isActive;
    this.applyFilters();
    
    // FOR REAL API:
    // this.apiService.put(`${apiRoutes.SYSTEMS}/${system.id}`, system).subscribe({
    //   next: () => {
    //     this.applyFilters();
    //   },
    //   error: (error) => {
    //     console.error('Error updating system:', error);
    //     system.isActive = !system.isActive; // Revert on error
    //   }
    // });
  }

  deleteSystem(system: GameSystem): void {
    if (confirm(`Are you sure you want to delete "${system.name}"? This action cannot be undone.`)) {
      // In real implementation, this would call the API
      const index = this.systems.findIndex(s => s.id === system.id);
      if (index > -1) {
        this.systems.splice(index, 1);
        this.applyFilters();
      }
      
      // FOR REAL API:
      // this.apiService.delete(`${apiRoutes.SYSTEMS}/${system.id}`).subscribe({
      //   next: () => {
      //     const index = this.systems.findIndex(s => s.id === system.id);
      //     if (index > -1) {
      //       this.systems.splice(index, 1);
      //       this.applyFilters();
      //     }
      //   },
      //   error: (error) => {
      //     console.error('Error deleting system:', error);
      //     alert('Failed to delete system. Please try again.');
      //   }
      // });
    }
  }

  editSystem(system: GameSystem): void {
    // This would typically open a modal or navigate to an edit page
    alert(`Edit functionality for "${system.name}" would be implemented here.`);
  }

  addNewSystem(): void {
    // This would typically open a modal or navigate to an add page
    alert('Add new system functionality would be implemented here.');
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // ========================================
  // TEST DATA METHOD - Remove when using real API
  // ========================================
  loadTestData(): void {
    this.loading = true;
    
    // Simulate API delay
    setTimeout(() => {
      // Sample game systems
      this.systems = [
        {
          id: 1,
          name: 'Nintendo Entertainment System',
          extension: '.nes',
          emulatorPath: 'C:\\emulators\\nestopia\\nestopia.exe',
          emulatorArguments: '-fullscreen',
          iconPath: '/icons/nes.png',
          isActive: true,
          createdAt: new Date('2024-01-15'),
          romCount: 45,
          description: '8-bit home video game console released by Nintendo',
          imageUrl: 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=NES'
        },
        {
          id: 2,
          name: 'Super Nintendo Entertainment System',
          extension: '.sfc',
          emulatorPath: 'C:\\emulators\\snes9x\\snes9x.exe',
          emulatorArguments: '-fullscreen -sound',
          iconPath: '/icons/snes.png',
          isActive: true,
          createdAt: new Date('2024-01-16'),
          romCount: 32,
          description: '16-bit home video game console',
          imageUrl: 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=SNES'
        },
        {
          id: 3,
          name: 'Sega Genesis',
          extension: '.md',
          emulatorPath: 'C:\\emulators\\genesis\\genesis.exe',
          emulatorArguments: '-fullscreen',
          iconPath: '/icons/genesis.png',
          isActive: true,
          createdAt: new Date('2024-01-17'),
          romCount: 28,
          description: '16-bit home video game console',
          imageUrl: 'https://via.placeholder.com/300x200/45B7D1/FFFFFF?text=Genesis'
        },
        {
          id: 4,
          name: 'Nintendo 64',
          extension: '.z64',
          emulatorPath: 'C:\\emulators\\project64\\project64.exe',
          emulatorArguments: '-fullscreen -sound',
          iconPath: '/icons/n64.png',
          isActive: true,
          createdAt: new Date('2024-01-18'),
          romCount: 18,
          description: '64-bit home video game console',
          imageUrl: 'https://via.placeholder.com/300x200/FFA07A/FFFFFF?text=N64'
        },
        {
          id: 5,
          name: 'PlayStation',
          extension: '.bin',
          emulatorPath: 'C:\\emulators\\epsxe\\epsxe.exe',
          emulatorArguments: '-fullscreen',
          iconPath: '/icons/psx.png',
          isActive: false,
          createdAt: new Date('2024-01-19'),
          romCount: 12,
          description: '32-bit home video game console',
          imageUrl: 'https://via.placeholder.com/300x200/98D8C8/FFFFFF?text=PSX'
        },
        {
          id: 6,
          name: 'Game Boy',
          extension: '.gb',
          emulatorPath: 'C:\\emulators\\vba\\visualboyadvance.exe',
          emulatorArguments: '-fullscreen',
          iconPath: '/icons/gb.png',
          isActive: true,
          createdAt: new Date('2024-01-20'),
          romCount: 67,
          description: '8-bit handheld video game console',
          imageUrl: 'https://via.placeholder.com/300x200/F7DC6F/FFFFFF?text=Game+Boy'
        },
        {
          id: 7,
          name: 'Game Boy Advance',
          extension: '.gba',
          emulatorPath: 'C:\\emulators\\vba\\visualboyadvance.exe',
          emulatorArguments: '-fullscreen',
          iconPath: '/icons/gba.png',
          isActive: true,
          createdAt: new Date('2024-01-21'),
          romCount: 89,
          description: '32-bit handheld video game console',
          imageUrl: 'https://via.placeholder.com/300x200/BF80FF/FFFFFF?text=GBA'
        },
        {
          id: 8,
          name: 'Sega Dreamcast',
          extension: '.cdi',
          emulatorPath: 'C:\\emulators\\demul\\demul.exe',
          emulatorArguments: '-fullscreen',
          iconPath: '/icons/dreamcast.png',
          isActive: false,
          createdAt: new Date('2024-01-22'),
          romCount: 8,
          description: '128-bit home video game console',
          imageUrl: 'https://via.placeholder.com/300x200/F8B500/FFFFFF?text=Dreamcast'
        }
      ];

      this.applyFilters();
      this.loading = false;
    }, 1000); // Simulate 1 second loading time
  }
}
