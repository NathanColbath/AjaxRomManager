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
  description?: string;
  extension?: string; // Keep for backward compatibility
  extensions?: string; // JSON serialized array from backend
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

  // Helper property to get extensions as array
  get extensionsList(): string[] {
    if (!this.extensions) {
      // Fallback to single extension for backward compatibility
      return this.extension ? [this.extension] : [];
    }
    try {
      return JSON.parse(this.extensions) || [];
    } catch {
      return [];
    }
  }

  // Helper property to set extensions from array
  set extensionsList(value: string[]) {
    this.extensions = value && value.length > 0 ? JSON.stringify(value) : undefined;
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
// Scan-Related Models (mirrors C# backend models)
// ========================================

// ScanOptions Model (mirrors C# ScanOptions class)
export class ScanOptions {
  recursive: boolean = true;
  autoDetectPlatform: boolean = true;
  createMetadata: boolean = true;
  skipDuplicates: boolean = true;
  maxFileSizeBytes: number = 1073741824; // 1GB default
  filePatterns: string[] = [];
  excludePatterns: string[] = [];
  hashAlgorithm: string = 'MD5';
  includeSubdirectories: boolean = true;
  platformId?: number;
  scanType: string = 'Full'; // Full, Incremental, Custom

  constructor(data?: Partial<ScanOptions>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

// ScanProgress Model (mirrors C# ScanProgress class)
export class ScanProgress {
  scanJobId: number = 0;
  status: string = '';
  progress: number = 0;
  filesFound: number = 0;
  filesProcessed: number = 0;
  filesAdded: number = 0;
  filesSkipped: number = 0;
  errors: number = 0;
  currentFile?: string;
  startedAt?: Date;
  estimatedCompletion?: Date;
  errorMessages: string[] = [];
  elapsedTime?: string;
  remainingTime?: string;

  constructor(data?: Partial<ScanProgress>) {
    if (data) {
      Object.assign(this, data);
      // Convert date strings to Date objects if needed
      if (data.startedAt && typeof data.startedAt === 'string') {
        this.startedAt = new Date(data.startedAt);
      }
      if (data.estimatedCompletion && typeof data.estimatedCompletion === 'string') {
        this.estimatedCompletion = new Date(data.estimatedCompletion);
      }
    }
  }
}

// ScanConfiguration Model (mirrors C# ScanConfiguration class)
export class ScanConfiguration {
  defaultDirectory: string = '';
  recursive: boolean = true;
  autoDetectPlatform: boolean = true;
  createMetadata: boolean = true;
  skipDuplicates: boolean = true;
  maxFileSizeMB: number = 1024; // 1GB default
  hashAlgorithm: string = 'MD5';
  includeSubdirectories: boolean = true;
  defaultFilePatterns: string[] = [];
  defaultExcludePatterns: string[] = [];
  progressUpdateIntervalSeconds: number = 5;
  enableBackgroundScanning: boolean = true;
  maxConcurrentScans: number = 3;

  constructor(data?: Partial<ScanConfiguration>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

// Request/Response DTOs
export class StartScanRequest {
  directoryPath: string = '';
  platformId?: number;
  options?: ScanOptions;
  name?: string;

  constructor(data?: Partial<StartScanRequest>) {
    if (data) {
      Object.assign(this, data);
      if (data.options) {
        this.options = new ScanOptions(data.options);
      }
    }
  }
}

export class RecurringScanRequest {
  directoryPath: string = '';
  cronExpression: string = '';
  platformId?: number;
  options?: ScanOptions;
  name?: string;

  constructor(data?: Partial<RecurringScanRequest>) {
    if (data) {
      Object.assign(this, data);
      if (data.options) {
        this.options = new ScanOptions(data.options);
      }
    }
  }
}

export class SetDirectoryRequest {
  directoryPath: string = '';

  constructor(data?: Partial<SetDirectoryRequest>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

export class ScanHistoryRequest {
  platformId?: number;
  page: number = 1;
  pageSize: number = 20;
  status?: string;
  fromDate?: Date;
  toDate?: Date;

  constructor(data?: Partial<ScanHistoryRequest>) {
    if (data) {
      Object.assign(this, data);
      // Convert date strings to Date objects if needed
      if (data.fromDate && typeof data.fromDate === 'string') {
        this.fromDate = new Date(data.fromDate);
      }
      if (data.toDate && typeof data.toDate === 'string') {
        this.toDate = new Date(data.toDate);
      }
    }
  }
}

export class PagedResult<T> {
  items: T[] = [];
  totalCount: number = 0;
  page: number = 1;
  pageSize: number = 20;

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  get hasNextPage(): boolean {
    return this.page < this.totalPages;
  }

  get hasPreviousPage(): boolean {
    return this.page > 1;
  }

  constructor(data?: Partial<PagedResult<T>>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

// SignalR Message Types
export interface ScanProgressMessage {
  scanJobId: number;
  status: string;
  progress?: ScanProgress;
  message?: string;
  timestamp: string;
  scanJob?: ScanJob;
  errorMessage?: string;
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
// ========================================
// Notification Models
// ========================================

export enum NotificationType {
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
  ScanProgress = 'scan_progress',
  ScanComplete = 'scan_complete',
  ScanError = 'scan_error'
}

export class Notification {
  id: string = '';
  type: NotificationType = NotificationType.Info;
  title: string = '';
  message: string = '';
  timestamp: Date = new Date();
  isRead: boolean = false;
  isDismissed: boolean = false;
  duration?: number; // Auto-dismiss after this many milliseconds
  actions?: NotificationAction[];
  data?: any; // Additional data for specific notification types

  constructor(data?: Partial<Notification>) {
    if (data) {
      Object.assign(this, data);
      if (data.timestamp && typeof data.timestamp === 'string') {
        this.timestamp = new Date(data.timestamp);
      }
      if (data.actions && Array.isArray(data.actions)) {
        this.actions = data.actions.map(action => new NotificationAction(action));
      }
    }
  }
}

export class NotificationAction {
  label: string = '';
  action: () => void = () => {};
  style?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

  constructor(data?: Partial<NotificationAction>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

// ========================================
// System Settings Models
// ========================================

export class SystemSettings {
  id?: number;
  key: string = '';
  value?: string;
  description?: string;
  category?: string;
  dataType: string = 'String'; // String, Int, Bool, Decimal, JSON
  isEncrypted: boolean = false;
  isReadOnly: boolean = false;
  lastModified: Date = new Date();
  modifiedBy?: string;

  constructor(data?: Partial<SystemSettings>) {
    if (data) {
      Object.assign(this, data);
      if (data.lastModified && typeof data.lastModified === 'string') {
        this.lastModified = new Date(data.lastModified);
      }
    }
  }
}

export class SetSettingRequest {
  value: string = '';
  category?: string;
  description?: string;

  constructor(data?: Partial<SetSettingRequest>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}

// Type Aliases for Component Compatibility
// ========================================
export type GameSystem = Platform;