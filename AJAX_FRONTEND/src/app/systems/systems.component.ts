import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlatformsService } from '../services/platforms.service';
import { FileUploadService } from '../services/file-upload.service';
import { Platform, SystemFilter } from '../models/rom.model';
import { SystemCardComponent } from '../system-card/system-card.component';

@Component({
  selector: 'app-systems',
  standalone: true,
  imports: [CommonModule, FormsModule, SystemCardComponent],
  templateUrl: './systems.component.html',
  styleUrl: './systems.component.scss'
})
export class SystemsComponent implements OnInit {
  systems: Platform[] = [];
  filteredSystems: Platform[] = [];
  platformRomCounts: { [key: number]: number } = {};
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

  constructor(private platformsService: PlatformsService, private fileUploadService: FileUploadService) {}

  ngOnInit(): void {
    this.loadSystems();
  }

  loadSystems(): void {
    this.loading = true;
    this.error = null;
    
    this.platformsService.getPlatformsWithRomCounts().subscribe({
      next: (platformsWithCounts) => {
        // Convert the API response to our interface and store ROM counts
        this.systems = platformsWithCounts.map(p => {
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
        console.error('Error loading systems:', error);
        this.error = 'Failed to load game systems';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.systems];

    // Apply search filter
    if (this.filter.searchTerm?.trim()) {
      const searchTerm = this.filter.searchTerm.toLowerCase();
      filtered = filtered.filter(system => 
        system.name.toLowerCase().includes(searchTerm) ||
        system.extension?.toLowerCase().includes(searchTerm)
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
          comparison = (a.roms?.length || 0) - (b.roms?.length || 0);
          break;
        case 'createdAt':
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
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

  toggleSystemStatus(system: Platform): void {
    if (!system.id) return;
    
    this.platformsService.toggleActiveStatus(system.id).subscribe({
      next: (updatedSystem) => {
        const index = this.systems.findIndex(s => s.id === system.id);
        if (index > -1) {
          this.systems[index] = updatedSystem;
          this.applyFilters();
        }
      },
      error: (error) => {
        console.error('Error updating system:', error);
        system.isActive = !system.isActive; // Revert on error
        alert('Failed to update system status. Please try again.');
      }
    });
  }

  deleteSystem(system: Platform): void {
    if (!system.id) return;
    
    if (confirm(`Are you sure you want to delete "${system.name}"? This action cannot be undone.`)) {
      this.platformsService.deletePlatform(system.id).subscribe({
        next: () => {
          const index = this.systems.findIndex(s => s.id === system.id);
          if (index > -1) {
            this.systems.splice(index, 1);
            this.applyFilters();
          }
        },
        error: (error) => {
          console.error('Error deleting system:', error);
          alert('Failed to delete system. Please try again.');
        }
      });
    }
  }

  editSystem(system: Platform): void {
    // This would typically open a modal or navigate to an edit page
    alert(`Edit functionality for "${system.name}" would be implemented here.`);
  }

  addNewSystem(): void {
    // This would typically open a modal or navigate to an add page
    alert('Add new system functionality would be implemented here.');
  }

  refreshData(): void {
    this.loadSystems();
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getPlatformLogoUrl(system: Platform): string {
    return this.fileUploadService.getPlatformLogoUrl(system.iconPath || '');
  }

  getSystemRomCount(systemId: number): number {
    return this.platformRomCounts[systemId] || 0;
  }
}
