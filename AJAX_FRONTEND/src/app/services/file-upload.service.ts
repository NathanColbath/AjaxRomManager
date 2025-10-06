import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpProgressEvent } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiService, apiRoutes } from './api.service';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResponse {
  filePath: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) { }

  /**
   * Uploads a platform logo image
   */
  uploadPlatformLogo(file: File, platformId?: number): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (platformId) {
      formData.append('platformId', platformId.toString());
    }

    return this.apiService.post<UploadResponse>(apiRoutes.FILE_UPLOAD_PLATFORM_LOGO, formData);
  }

  /**
   * Uploads a platform logo with progress tracking
   */
  uploadPlatformLogoWithProgress(file: File, platformId?: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (platformId) {
      formData.append('platformId', platformId.toString());
    }

    return this.http.post<UploadResponse>(
      `${this.apiService.apiUrl}/${apiRoutes.FILE_UPLOAD_PLATFORM_LOGO}`,
      formData,
      {
        reportProgress: true,
        observe: 'events'
      }
    ).pipe(
      map((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progressEvent = event as HttpProgressEvent;
            return {
              loaded: progressEvent.loaded,
              total: progressEvent.total || 0,
              percentage: progressEvent.total ? Math.round(100 * progressEvent.loaded / progressEvent.total) : 0
            } as UploadProgress;
          
          case HttpEventType.Response:
            return event.body as UploadResponse;
          
          default:
            return event;
        }
      })
    );
  }

  /**
   * Deletes a platform logo
   */
  deletePlatformLogo(filePath: string): Observable<{ message: string }> {
    return this.apiService.delete<{ message: string }>(`${apiRoutes.FILE_UPLOAD_PLATFORM_LOGO}?filePath=${encodeURIComponent(filePath)}`);
  }

  /**
   * Gets the URL for a platform logo
   */
  getPlatformLogoUrl(filePath: string): string {
    if (!filePath) {
      return '';
    }
    
    // If it's already a full URL or data URL, return as is
    if (filePath.startsWith('http') || filePath.startsWith('data:')) {
      return filePath;
    }
    
    // Return the API endpoint URL for the file
    return `${this.apiService.apiUrl}/${apiRoutes.FILE_UPLOAD_PLATFORM_LOGO}?filePath=${encodeURIComponent(filePath)}`;
  }

  /**
   * Validates a file before upload
   */
  validateImageFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return {
        isValid: false,
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'
      };
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size must be less than 5MB.'
      };
    }

    return { isValid: true };
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
}
