// TypeScript models that mirror the C# backend models exactly

// ========================================
// Rom Model (mirrors C# Rom class)
// ========================================
export class Rom {
  id?: number;
  title: string = '';
  filePath: string = '';
  fileName?: string;
  fileSize: number = 0;
  fileHash?: string;
  platformId: number = 0;
  platform?: Platform;
  dateAdded: Date = new Date();
  lastPlayed?: Date;
  playCount: number = 0;
  isFavorite: boolean = false;
  isArchived: boolean = false;
  metadata?: RomMetadata;

  constructor(data?: Partial<Rom>) {
    if (data) {
      Object.assign(this, data);
      // Convert date strings to Date objects if needed
      if (data.dateAdded && typeof data.dateAdded === 'string') {
        this.dateAdded = new Date(data.dateAdded);
      }
      if (data.lastPlayed && typeof data.lastPlayed === 'string') {
        this.lastPlayed = new Date(data.lastPlayed);
      }
      if (data.platform && typeof data.platform === 'object') {
        this.platform = new Platform(data.platform);
      }
      if (data.metadata && typeof data.metadata === 'object') {
        this.metadata = new RomMetadata(data.metadata);
      }
    }
  }
}

// ========================================
// Platform Model (mirrors C# Platform class)
// ========================================
export class Platform {
  id?: number;
  name: string = '';
  extension?: string;
  emulatorPath?: string;
  emulatorArguments?: string;
  iconPath?: string;
  isActive: boolean = true;
  createdAt: Date = new Date();
  roms: Rom[] = [];
  scanJobs: ScanJob[] = [];

  constructor(data?: Partial<Platform>) {
    if (data) {
      Object.assign(this, data);
      // Convert date strings to Date objects if needed
      if (data.createdAt && typeof data.createdAt === 'string') {
        this.createdAt = new Date(data.createdAt);
      }
      // Convert arrays of objects to proper class instances
      if (data.roms && Array.isArray(data.roms)) {
        this.roms = data.roms.map(rom => new Rom(rom));
      }
      if (data.scanJobs && Array.isArray(data.scanJobs)) {
        this.scanJobs = data.scanJobs.map(job => new ScanJob(job));
      }
    }
  }
}

// ========================================
// RomMetadata Model (mirrors C# RomMetadata class)
// ========================================
export class RomMetadata {
  id?: number;
  romId: number = 0;
  rom?: Rom;
  description?: string;
  genre?: string;
  developer?: string;
  publisher?: string;
  releaseDate?: Date;
  rating?: number; // decimal in C# maps to number in TypeScript
  coverImagePath?: string;
  screenshotPaths?: string; // JSON array of paths
  tags?: string; // JSON array of tags
  lastUpdated: Date = new Date();

  constructor(data?: Partial<RomMetadata>) {
    if (data) {
      Object.assign(this, data);
      // Convert date strings to Date objects if needed
      if (data.releaseDate && typeof data.releaseDate === 'string') {
        this.releaseDate = new Date(data.releaseDate);
      }
      if (data.lastUpdated && typeof data.lastUpdated === 'string') {
        this.lastUpdated = new Date(data.lastUpdated);
      }
      if (data.rom && typeof data.rom === 'object') {
        this.rom = new Rom(data.rom);
      }
    }
  }
}

// ========================================
// ScanJob Model (mirrors C# ScanJob class)
// ========================================
export class ScanJob {
  id?: number;
  name: string = '';
  scanPath: string = '';
  platformId?: number;
  platform?: Platform;
  status: string = 'Pending'; // Pending, Running, Completed, Failed, Cancelled
  progress: number = 0; // decimal in C# maps to number in TypeScript
  filesFound: number = 0;
  filesProcessed: number = 0;
  errors: number = 0;
  startedAt?: Date;
  completedAt?: Date;
  lastRunAt?: Date;
  isRecurring: boolean = false;
  cronExpression?: string;
  createdAt: Date = new Date();

  constructor(data?: Partial<ScanJob>) {
    if (data) {
      Object.assign(this, data);
      // Convert date strings to Date objects if needed
      if (data.startedAt && typeof data.startedAt === 'string') {
        this.startedAt = new Date(data.startedAt);
      }
      if (data.completedAt && typeof data.completedAt === 'string') {
        this.completedAt = new Date(data.completedAt);
      }
      if (data.lastRunAt && typeof data.lastRunAt === 'string') {
        this.lastRunAt = new Date(data.lastRunAt);
      }
      if (data.createdAt && typeof data.createdAt === 'string') {
        this.createdAt = new Date(data.createdAt);
      }
      if (data.platform && typeof data.platform === 'object') {
        this.platform = new Platform(data.platform);
      }
    }
  }
}

// ========================================
// Filter Interfaces for Frontend Components
// ========================================
export interface RomFilter {
  platformId?: number;
  searchTerm?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  genre?: string;
  developer?: string;
  publisher?: string;
  minRating?: number;
  maxRating?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface SystemFilter {
  searchTerm?: string;
  isActive?: boolean;
  hasEmulator?: boolean;
  sortBy?: string;
  sortOrder?: string;
}

// ========================================
// Type Aliases for Component Compatibility
// ========================================
export type GameSystem = Platform;