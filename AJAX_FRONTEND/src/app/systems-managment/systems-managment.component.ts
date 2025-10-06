import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { PlatformsService } from '../services/platforms.service';
import { FileUploadService } from '../services/file-upload.service';
import { NotificationService } from '../services/notification.service';
import { Platform } from '../models/rom.model';

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

  // Loading and error states
  loading = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private platformsService: PlatformsService,
    private fileUploadService: FileUploadService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadPlatforms();
  }

  loadPlatforms(): void {
    this.loading = true;
    this.error = null;
    
    this.platformsService.getAllPlatforms().subscribe({
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

  applyFilters(): void {
    let filtered = [...this.platforms];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(platform => 
        platform.name.toLowerCase().includes(searchLower) ||
        (platform.description && platform.description.toLowerCase().includes(searchLower)) ||
        (platform.extensions && platform.extensions.toLowerCase().includes(searchLower))
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
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'roms':
          return (b.roms?.length || 0) - (a.roms?.length || 0);
        default:
          return 0;
      }
    });

    this.updatePagination(filtered);
  }

  updatePagination(filteredPlatforms: Platform[]): void {
    this.totalPages = Math.ceil(filteredPlatforms.length / this.itemsPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredPlatforms = filteredPlatforms.slice(startIndex, endIndex);
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
    this.router.navigate(['/systems-edit', platform.id]);
  }

  togglePlatformStatus(platform: Platform): void {
    if (!platform.id) return;
    
    this.platformsService.toggleActiveStatus(platform.id).subscribe({
      next: (updatedPlatform) => {
        const index = this.platforms.findIndex(p => p.id === platform.id);
        if (index > -1) {
          this.platforms[index] = updatedPlatform;
          this.applyFilters();
          this.notificationService.showSuccess(
            'Platform Status Updated',
            `Platform "${platform.name}" is now ${updatedPlatform.isActive ? 'active' : 'inactive'}.`
          );
        }
      },
      error: (error) => {
        console.error('Error updating platform status:', error);
        platform.isActive = !platform.isActive; // Revert on error
        this.notificationService.showPersistentError(
          'Status Update Failed',
          `Failed to update platform "${platform.name}" status. Please try again.`
        );
      }
    });
  }

  deletePlatform(platform: Platform): void {
    if (!platform.id) return;
    
    if (confirm(`Are you sure you want to delete "${platform.name}"? This action cannot be undone.`)) {
      this.platformsService.deletePlatform(platform.id).subscribe({
        next: () => {
          this.platforms = this.platforms.filter(p => p.id !== platform.id);
          this.applyFilters();
          this.notificationService.showPersistentSuccess(
            'Platform Deleted',
            `Platform "${platform.name}" has been successfully deleted.`
          );
        },
        error: (error) => {
          console.error('Error deleting platform:', error);
          this.notificationService.showPersistentError(
            'Delete Failed',
            `Failed to delete platform "${platform.name}". Please try again.`
          );
        }
      });
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

  refreshData(): void {
    this.loadPlatforms();
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onSortChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onStatusFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.sortBy = 'name';
    this.currentPage = 1;
    this.applyFilters();
  }

  getLastScanDate(platform: Platform): Date | null {
    if (!platform.scanJobs || platform.scanJobs.length === 0) {
      return null;
    }
    
    // Find the most recent scan job
    const sortedJobs = platform.scanJobs.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return sortedJobs[0]?.createdAt || null;
  }

  getPlatformLogoUrl(platform: Platform): string {
    return this.fileUploadService.getPlatformLogoUrl(platform.iconPath || '');
  }
}
