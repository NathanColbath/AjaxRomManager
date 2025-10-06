import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpProgressEvent } from '@angular/common/http';
import { Observable, map, catchError, throwError, filter } from 'rxjs';
import { ApiService, apiRoutes } from './api.service';
import { Platform } from '../models/rom.model';

export interface RomUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  fileName: string;
}

export interface RomUploadResponse {
  success: boolean;
  romId?: number;
  fileName: string;
  platformId: number;
  platformName: string;
  filePath: string;
  message?: string;
}

export interface RomUploadResult {
  fileName: string;
  file: File;
  platformId?: number;
  platformName?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  result?: RomUploadResponse;
}

export interface PlatformDetectionResult {
  fileName: string;
  extension: string;
  possiblePlatforms: Platform[];
  recommendedPlatform?: Platform;
}

@Injectable({
  providedIn: 'root'
})
export class RomUploadService {

  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) { }

  /**
   * Detects possible platforms for a file based on its extension
   */
  detectPlatform(file: File, platforms: Platform[]): PlatformDetectionResult {
    const extension = this.getFileExtension(file.name).toLowerCase();
    console.log(`Detecting platform for file: ${file.name}, extracted extension: "${extension}"`);
    
    // Ensure platforms array is valid
    if (!platforms || platforms.length === 0) {
      console.warn('No platforms provided for detection:', file.name);
      return {
        fileName: file.name,
        extension,
        possiblePlatforms: [],
        recommendedPlatform: undefined
      };
    }
    
    // Find platforms that support this extension with proper null checks
    const possiblePlatforms = platforms.filter(platform => {
      // Debug logging
      console.log(`Checking platform: ${platform.name}`, {
        extension: platform.extension,
        extensions: platform.extensions,
        extensionsList: platform.extensionsList
      });
      
      // Get extensions array - try extensionsList first, then parse extensions manually
      let extensionsArray: string[] = [];
      
      if (platform.extensionsList && Array.isArray(platform.extensionsList)) {
        extensionsArray = platform.extensionsList;
        console.log(`Using extensionsList:`, extensionsArray);
      } else if (platform.extensions) {
        try {
          extensionsArray = JSON.parse(platform.extensions);
          console.log(`Parsed extensions manually:`, extensionsArray);
        } catch (error) {
          console.warn(`Failed to parse extensions for ${platform.name}:`, platform.extensions, error);
          // Try comma-separated fallback
          if (typeof platform.extensions === 'string') {
            extensionsArray = platform.extensions.split(',').map(ext => ext.trim()).filter(ext => ext.length > 0);
            console.log(`Used comma-separated fallback:`, extensionsArray);
          }
        }
      } else if (platform.extension) {
        extensionsArray = [platform.extension];
        console.log(`Using single extension fallback:`, extensionsArray);
      }
      
      if (!Array.isArray(extensionsArray) || extensionsArray.length === 0) {
        console.log(`Platform ${platform.name} has no valid extensions`);
        return false;
      }
      
      // Check if any extension matches
      const hasMatch = extensionsArray.some(ext => {
        if (!ext || typeof ext !== 'string') {
          return false;
        }
        // Remove dots from both extensions for comparison
        const normalizedExt = ext.toLowerCase().replace(/\./g, '');
        const normalizedFileExt = extension.replace(/\./g, '');
        const matches = normalizedExt === normalizedFileExt;
        console.log(`Comparing "${normalizedExt}" with "${normalizedFileExt}": ${matches}`);
        return matches;
      });
      
      console.log(`Platform ${platform.name} matches extension ${extension}: ${hasMatch}`);
      return hasMatch;
    });

    return {
      fileName: file.name,
      extension,
      possiblePlatforms,
      recommendedPlatform: possiblePlatforms.length === 1 ? possiblePlatforms[0] : undefined
    };
  }

  /**
   * Uploads a ROM file with progress tracking
   */
  uploadRom(file: File, platformId: number): Observable<RomUploadProgress | RomUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('platformId', platformId.toString());

    return this.http.post<RomUploadResponse>(
      `${this.apiService.apiUrl}/${apiRoutes.ROMS_UPLOAD}`,
      formData,
      {
        reportProgress: true,
        observe: 'events'
      }
    ).pipe(
      filter((event: HttpEvent<any>) => 
        event.type === HttpEventType.UploadProgress || 
        event.type === HttpEventType.Response
      ),
      map((event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress) {
          const progressEvent = event as HttpProgressEvent;
          return {
            loaded: progressEvent.loaded,
            total: progressEvent.total || 0,
            percentage: progressEvent.total ? Math.round(100 * progressEvent.loaded / progressEvent.total) : 0,
            fileName: file.name
          } as RomUploadProgress;
        } else if (event.type === HttpEventType.Response) {
          return event.body as RomUploadResponse;
        }
        return null;
      }),
      filter((result): result is RomUploadProgress | RomUploadResponse => result !== null),
      catchError(error => {
        console.error('ROM upload error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Uploads multiple ROM files with progress tracking
   */
  uploadMultipleRoms(files: File[], platformId: number): Observable<RomUploadProgress | RomUploadResponse[]> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('platformId', platformId.toString());

    return this.http.post<RomUploadResponse[]>(
      `${this.apiService.apiUrl}/${apiRoutes.ROMS_UPLOAD_MULTIPLE}`,
      formData,
      {
        reportProgress: true,
        observe: 'events'
      }
    ).pipe(
      filter((event: HttpEvent<any>) => 
        event.type === HttpEventType.UploadProgress || 
        event.type === HttpEventType.Response
      ),
      map((event: HttpEvent<any>) => {
        if (event.type === HttpEventType.UploadProgress) {
          const progressEvent = event as HttpProgressEvent;
          return {
            loaded: progressEvent.loaded,
            total: progressEvent.total || 0,
            percentage: progressEvent.total ? Math.round(100 * progressEvent.loaded / progressEvent.total) : 0,
            fileName: files.map(f => f.name).join(', ')
          } as RomUploadProgress;
        } else if (event.type === HttpEventType.Response) {
          return event.body as RomUploadResponse[];
        }
        return null;
      }),
      filter((result): result is RomUploadProgress | RomUploadResponse[] => result !== null),
      catchError(error => {
        console.error('Multiple ROM upload error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Validates a ROM file before upload
   */
  validateRomFile(file: File): { isValid: boolean; error?: string } {
    // Check file size (max 2GB)
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB in bytes
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size must be less than 2GB.'
      };
    }

    // Check if file has an extension
    const extension = this.getFileExtension(file.name);
    if (!extension) {
      return {
        isValid: false,
        error: 'File must have a valid extension.'
      };
    }

    return { isValid: true };
  }

  /**
   * Gets file extension from filename
   */
  private getFileExtension(filename: string): string {
    const extension = filename.split('.').pop() || '';
    console.log(`Extracting extension from "${filename}": "${extension}"`);
    return extension;
  }

  /**
   * Formats file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Creates a preview URL for a file
   */
  createPreviewUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Calculates MD5 hash of a file using a fallback method
   */
  async calculateFileHash(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          
          // Try Web Crypto API with SHA-256 first (more widely supported)
          try {
            const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            resolve(hashHex);
          } catch (cryptoError) {
            // Fallback to a simple hash based on file properties
            console.warn('Web Crypto API not available, using fallback hash method');
            const fallbackHash = this.generateFallbackHash(file, arrayBuffer);
            resolve(fallbackHash);
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file for hashing'));
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Generates a fallback hash when Web Crypto API is not available
   */
  private generateFallbackHash(file: File, arrayBuffer: ArrayBuffer): string {
    // Create a simple hash based on file properties and content
    const fileName = file.name;
    const fileSize = file.size;
    const lastModified = file.lastModified;
    
    // Use first and last bytes of the file for additional uniqueness
    const uint8Array = new Uint8Array(arrayBuffer);
    const firstBytes = Array.from(uint8Array.slice(0, Math.min(1024, uint8Array.length)));
    const lastBytes = Array.from(uint8Array.slice(Math.max(0, uint8Array.length - 1024)));
    
    // Combine all properties into a hash-like string
    const combined = `${fileName}_${fileSize}_${lastModified}_${firstBytes.join('')}_${lastBytes.join('')}`;
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  /**
   * Checks if a file hash already exists in the system
   */
  checkDuplicateHash(hash: string): Observable<{ isDuplicate: boolean; existingRom?: any }> {
    return this.apiService.get<{ isDuplicate: boolean; existingRom?: any }>(`${apiRoutes.ROMS}/check-duplicate?hash=${hash}`);
  }

  /**
   * Validates files and checks for duplicates
   */
  async validateFilesForDuplicates(files: File[]): Promise<{ validFiles: File[]; duplicates: { file: File; existingRom: any }[] }> {
    const validFiles: File[] = [];
    const duplicates: { file: File; existingRom: any }[] = [];

    for (const file of files) {
      const validation = this.validateRomFile(file);
      if (!validation.isValid) {
        continue; // Skip invalid files
      }

      try {
        const hash = await this.calculateFileHash(file);
        const duplicateCheck = await this.checkDuplicateHash(hash).toPromise();
        
        if (duplicateCheck?.isDuplicate) {
          duplicates.push({ file, existingRom: duplicateCheck.existingRom });
        } else {
          validFiles.push(file);
        }
      } catch (error) {
        console.error(`Error checking duplicate for ${file.name}:`, error);
        // If hash calculation fails, still allow the file to be uploaded
        validFiles.push(file);
      }
    }

    return { validFiles, duplicates };
  }
}
