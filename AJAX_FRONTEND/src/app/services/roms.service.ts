import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, apiRoutes } from './api.service';
import { Rom, RomMetadata, RomFilter, PagedResult } from '../models/rom.model';

@Injectable({
  providedIn: 'root'
})
export class RomsService {

  constructor(private apiService: ApiService) {}

  /**
   * Retrieves all ROMs
   */
  getAllRoms(): Observable<Rom[]> {
    return this.apiService.get<Rom[]>(apiRoutes.ROMS);
  }

  /**
   * Retrieves ROMs with pagination and filtering
   */
  getRoms(filter: RomFilter): Observable<PagedResult<Rom>> {
    const params = {
      page: filter.page?.toString() || '1',
      pageSize: filter.pageSize?.toString() || '20',
      ...(filter.platformId && { platformId: filter.platformId.toString() }),
      ...(filter.searchTerm && { searchTerm: filter.searchTerm }),
      ...(filter.isFavorite !== undefined && { isFavorite: filter.isFavorite.toString() }),
      ...(filter.isArchived !== undefined && { isArchived: filter.isArchived.toString() }),
      ...(filter.genre && { genre: filter.genre }),
      ...(filter.developer && { developer: filter.developer }),
      ...(filter.publisher && { publisher: filter.publisher }),
      ...(filter.minRating && { minRating: filter.minRating.toString() }),
      ...(filter.maxRating && { maxRating: filter.maxRating.toString() }),
      ...(filter.sortBy && { sortBy: filter.sortBy }),
      ...(filter.sortOrder && { sortOrder: filter.sortOrder })
    };
    return this.apiService.getWithParams<PagedResult<Rom>>(`${apiRoutes.ROMS}/filtered`, params);
  }

  /**
   * Retrieves a specific ROM by ID
   */
  getRomById(id: number): Observable<Rom> {
    return this.apiService.get<Rom>(`${apiRoutes.ROMS}/${id}`);
  }

  /**
   * Creates a new ROM
   */
  createRom(rom: Rom): Observable<Rom> {
    return this.apiService.post<Rom>(apiRoutes.ROMS, rom);
  }

  /**
   * Updates an existing ROM
   */
  updateRom(id: number, rom: Rom): Observable<Rom> {
    return this.apiService.put<Rom>(`${apiRoutes.ROMS}/${id}`, rom);
  }

  /**
   * Deletes a ROM
   */
  deleteRom(id: number): Observable<Rom> {
    return this.apiService.delete<Rom>(`${apiRoutes.ROMS}/${id}`);
  }

  /**
   * Retrieves metadata for a specific ROM
   */
  getRomMetadata(id: number): Observable<RomMetadata> {
    return this.apiService.get<RomMetadata>(`${apiRoutes.ROMS}/${id}/metadata`);
  }

  /**
   * Updates ROM metadata
   */
  updateRomMetadata(id: number, metadata: RomMetadata): Observable<RomMetadata> {
    return this.apiService.put<RomMetadata>(`${apiRoutes.ROMS}/${id}/metadata`, metadata);
  }

  /**
   * Toggles favorite status for a ROM
   */
  toggleFavorite(id: number): Observable<Rom> {
    return this.apiService.put<Rom>(`${apiRoutes.ROMS}/${id}/favorite`, {});
  }

  /**
   * Archives/unarchives a ROM
   */
  toggleArchive(id: number): Observable<Rom> {
    return this.apiService.put<Rom>(`${apiRoutes.ROMS}/${id}/archive`, {});
  }

  /**
   * Gets ROMs by platform
   */
  getRomsByPlatform(platformId: number): Observable<Rom[]> {
    return this.apiService.get<Rom[]>(`${apiRoutes.ROMS}/platform/${platformId}`);
  }

  /**
   * Gets favorite ROMs
   */
  getFavoriteRoms(): Observable<Rom[]> {
    return this.apiService.get<Rom[]>(`${apiRoutes.ROMS}/favorites`);
  }

  /**
   * Gets archived ROMs
   */
  getArchivedRoms(): Observable<Rom[]> {
    return this.apiService.get<Rom[]>(`${apiRoutes.ROMS}/archived`);
  }

  /**
   * Searches ROMs by title
   */
  searchRoms(searchTerm: string): Observable<Rom[]> {
    return this.apiService.getWithParams<Rom[]>(`${apiRoutes.ROMS}/search`, { searchTerm });
  }

  /**
   * Gets ROM statistics
   */
  getRomStatistics(): Observable<any> {
    return this.apiService.get<any>(`${apiRoutes.ROMS}/statistics`);
  }
}
