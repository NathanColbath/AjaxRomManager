import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Platform {
  id: number;
  name: string;
  description: string;
  extension: string;
  emulatorPath: string;
  emulatorArguments: string;
  iconPath: string;
  isActive: boolean;
  createdAt: Date;
  extensions: string[];
  romCount?: number;
  scanJobsCount?: number;
  lastScanDate?: Date;
}

@Component({
  selector: 'app-systems-managment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './systems-managment.component.html',
  styleUrl: './systems-managment.component.scss'
})
export class SystemsManagmentComponent implements OnInit {
  
  platforms: Platform[] = [];
  filteredPlatforms: Platform[] = [];
  
  // Search and filter properties
  searchTerm: string = '';
  statusFilter: string = '';
  sortBy: string = 'name';
  
  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalPages: number = 1;

  constructor() { }

  ngOnInit(): void {
    this.loadPlatforms();
  }

  loadPlatforms(): void {
    // TODO: Load platforms from API
    // Mock data for now
    this.platforms = [
      {
        id: 1,
        name: 'Nintendo Entertainment System',
        description: '8-bit home video game console released by Nintendo',
        extension: 'nes',
        emulatorPath: '/emulators/fceux.exe',
        emulatorArguments: '--fullscreen',
        iconPath: '',
        isActive: true,
        createdAt: new Date('2024-01-15'),
        extensions: ['nes'],
        romCount: 45,
        scanJobsCount: 2,
        lastScanDate: new Date('2024-01-20')
      },
      {
        id: 2,
        name: 'Super Nintendo Entertainment System',
        description: '16-bit home video game console',
        extension: 'snes',
        emulatorPath: '/emulators/snes9x.exe',
        emulatorArguments: '--fullscreen --controller 1',
        iconPath: '',
        isActive: true,
        createdAt: new Date('2024-01-16'),
        extensions: ['snes', 'smc'],
        romCount: 32,
        scanJobsCount: 1,
        lastScanDate: new Date('2024-01-18')
      },
      {
        id: 3,
        name: 'Game Boy',
        description: '8-bit handheld game console',
        extension: 'gb',
        emulatorPath: '/emulators/vba.exe',
        emulatorArguments: '--fullscreen',
        iconPath: '',
        isActive: false,
        createdAt: new Date('2024-01-17'),
        extensions: ['gb'],
        romCount: 28,
        scanJobsCount: 0,
        lastScanDate: undefined
      }
    ];
    
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.platforms];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(platform => 
        platform.name.toLowerCase().includes(searchLower) ||
        platform.description.toLowerCase().includes(searchLower) ||
        platform.extensions.some(ext => ext.toLowerCase().includes(searchLower))
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
        case 'created':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'roms':
          return (b.romCount || 0) - (a.romCount || 0);
        default:
          return 0;
      }
    });

    this.filteredPlatforms = filtered;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredPlatforms.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredPlatforms = this.filteredPlatforms.slice(startIndex, endIndex);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = Math.min(5, this.totalPages);
    const startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    
    for (let i = 0; i < maxPages; i++) {
      pages.push(startPage + i);
    }
    
    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilters();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  getEmulatorName(path: string): string {
    return path.split('/').pop()?.split('.')[0] || 'Unknown';
  }

  editPlatform(platform: Platform): void {
    // TODO: Navigate to edit platform page
    console.log('Edit platform:', platform);
  }

  togglePlatformStatus(platform: Platform): void {
    platform.isActive = !platform.isActive;
    // TODO: Update platform status via API
    console.log('Toggle platform status:', platform);
  }

  deletePlatform(platform: Platform): void {
    if (confirm(`Are you sure you want to delete "${platform.name}"? This action cannot be undone.`)) {
      // TODO: Delete platform via API
      this.platforms = this.platforms.filter(p => p.id !== platform.id);
      this.applyFilters();
      console.log('Delete platform:', platform);
    }
  }

  viewPlatformDetails(platform: Platform): void {
    // TODO: Navigate to platform details page
    console.log('View platform details:', platform);
  }

  scanPlatform(platform: Platform): void {
    // TODO: Start scan job for platform
    console.log('Scan platform:', platform);
  }
}
