export interface Rom {
  id: number;
  name: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  releaseDate?: Date;
  platformId: number;
  platformName?: string;
  description?: string;
  imageUrl?: string;
  isFavorite?: boolean;
  lastPlayed?: Date;
  playCount?: number;
}

export interface Platform {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface GameSystem {
  id: number;
  name: string;
  extension?: string;
  emulatorPath?: string;
  emulatorArguments?: string;
  iconPath?: string;
  isActive: boolean;
  createdAt: Date;
  romCount?: number;
  description?: string;
  imageUrl?: string;
}

export interface SystemFilter {
  searchTerm: string;
  sortBy: 'name' | 'romCount' | 'createdAt';
  sortOrder: 'asc' | 'desc';
  isActive?: boolean;
}

export interface RomFilter {
  searchTerm: string;
  sortBy: 'name' | 'fileSize' | 'releaseDate';
  sortOrder: 'asc' | 'desc';
  platformId?: number;
}
