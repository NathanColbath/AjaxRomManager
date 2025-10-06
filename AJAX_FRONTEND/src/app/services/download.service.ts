import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService, apiRoutes } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  constructor(
    private http: HttpClient,
    private apiService: ApiService
  ) {}

  /**
   * Downloads a ROM file by ID
   * @param romId The ID of the ROM to download
   * @param fileName Optional filename for the download
   */
  downloadRom(romId: number, fileName?: string): Observable<Blob> {
    const url = `${this.apiService.apiUrl}/${apiRoutes.ROMS}/${romId}/download`;
    
    return this.http.get(url, {
      responseType: 'blob',
      observe: 'body'
    });
  }

  /**
   * Initiates a download by creating a blob URL and triggering the download
   * @param romId The ID of the ROM to download
   * @param fileName Optional filename for the download
   */
  async initiateDownload(romId: number, fileName?: string): Promise<void> {
    try {
      const blob = await this.downloadRom(romId, fileName).toPromise();
      
      if (blob) {
        // Create blob URL
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Create temporary anchor element
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName || `rom_${romId}.rom`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }

  /**
   * Gets the download URL for a ROM (for use with direct links)
   * @param romId The ID of the ROM
   * @returns The download URL
   */
  getDownloadUrl(romId: number): string {
    return `${this.apiService.apiUrl}/${apiRoutes.ROMS}/${romId}/download`;
  }
}
