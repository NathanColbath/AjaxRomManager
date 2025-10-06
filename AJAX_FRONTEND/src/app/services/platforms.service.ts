import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService, apiRoutes } from './api.service';
import { Platform, SystemFilter } from '../models/rom.model';

@Injectable({
  providedIn: 'root'
})
export class PlatformsService {

  constructor(private apiService: ApiService) {}

  /**
   * Retrieves all platforms
   */
  getAllPlatforms(): Observable<Platform[]> {
    return this.apiService.get<Platform[]>(apiRoutes.PLATFORMS).pipe(
      map(platforms => platforms.map(platform => new Platform(platform)))
    );
  }

  /**
   * Retrieves platforms with ROM counts
   */
  getPlatformsWithRomCounts(): Observable<any[]> {
    return this.apiService.get<any[]>(`${apiRoutes.PLATFORMS}/with-counts`);
  }

  /**
   * Retrieves platforms with filtering
   */
  getPlatforms(filter: SystemFilter): Observable<Platform[]> {
    const params = {
      ...(filter.searchTerm && { searchTerm: filter.searchTerm }),
      ...(filter.isActive !== undefined && { isActive: filter.isActive.toString() })
    };
    return this.apiService.getWithParams<Platform[]>(apiRoutes.PLATFORMS, params);
  }

  /**
   * Retrieves a specific platform by ID
   */
  getPlatformById(id: number): Observable<Platform> {
    return this.apiService.get<Platform>(`${apiRoutes.PLATFORMS}/${id}`);
  }

  /**
   * Creates a new platform
   */
  createPlatform(platform: Platform): Observable<Platform> {
    return this.apiService.post<Platform>(apiRoutes.PLATFORMS, platform);
  }

  /**
   * Updates an existing platform
   */
  updatePlatform(id: number, platform: Platform): Observable<Platform> {
    return this.apiService.put<Platform>(`${apiRoutes.PLATFORMS}/${id}`, platform);
  }

  /**
   * Deletes a platform
   */
  deletePlatform(id: number): Observable<Platform> {
    return this.apiService.delete<Platform>(`${apiRoutes.PLATFORMS}/${id}`);
  }

  /**
   * Gets active platforms only
   */
  getActivePlatforms(): Observable<Platform[]> {
    return this.apiService.get<Platform[]>(`${apiRoutes.PLATFORMS}/active`);
  }

  /**
   * Toggles platform active status
   */
  toggleActiveStatus(id: number): Observable<Platform> {
    return this.apiService.put<Platform>(`${apiRoutes.PLATFORMS}/${id}/toggle-active`, {});
  }

  /**
   * Gets platform statistics
   */
  getPlatformStatistics(): Observable<any> {
    return this.apiService.get<any>(`${apiRoutes.PLATFORMS}/statistics`);
  }

  /**
   * Searches platforms by name
   */
  searchPlatforms(searchTerm: string): Observable<Platform[]> {
    return this.apiService.getWithParams<Platform[]>(`${apiRoutes.PLATFORMS}/search`, { searchTerm });
  }
}
