import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, apiRoutes } from './api.service';
import { SystemSettings, SetSettingRequest, ScanConfiguration, SetDirectoryRequest } from '../models/rom.model';

@Injectable({
  providedIn: 'root'
})
export class SystemSettingsService {

  constructor(private apiService: ApiService) {}

  /**
   * Retrieves all system settings
   */
  getAllSettings(): Observable<ScanConfiguration> {
    return this.apiService.get<ScanConfiguration>(apiRoutes.SYSTEM_SETTINGS);
  }

  /**
   * Retrieves a specific setting by key
   */
  getSetting(key: string): Observable<string> {
    return this.apiService.get<string>(`${apiRoutes.SYSTEM_SETTINGS}/${key}`);
  }

  /**
   * Creates or updates a system setting
   */
  setSetting(key: string, request: SetSettingRequest): Observable<any> {
    return this.apiService.post(`${apiRoutes.SYSTEM_SETTINGS}/${key}`, request);
  }

  /**
   * Deletes a system setting
   */
  deleteSetting(key: string): Observable<any> {
    return this.apiService.delete(`${apiRoutes.SYSTEM_SETTINGS}/${key}`);
  }

  /**
   * Checks if a setting exists
   */
  settingExists(key: string): Observable<boolean> {
    return this.apiService.get<boolean>(`${apiRoutes.SYSTEM_SETTINGS}/${key}/exists`);
  }

  /**
   * Retrieves scan configuration settings
   */
  getScanConfiguration(): Observable<ScanConfiguration> {
    return this.apiService.get<ScanConfiguration>(apiRoutes.SYSTEM_SETTINGS_SCAN_CONFIG);
  }

  /**
   * Updates scan configuration settings
   */
  updateScanConfiguration(config: ScanConfiguration): Observable<any> {
    return this.apiService.put(apiRoutes.SYSTEM_SETTINGS_SCAN_CONFIG, config);
  }

  /**
   * Retrieves the current scan directory
   */
  getScanDirectory(): Observable<string> {
    return this.apiService.get<string>(apiRoutes.SYSTEM_SETTINGS_SCAN_DIRECTORY);
  }

  /**
   * Sets the scan directory
   */
  setScanDirectory(request: SetDirectoryRequest): Observable<any> {
    return this.apiService.put(apiRoutes.SYSTEM_SETTINGS_SCAN_DIRECTORY, request);
  }

  /**
   * Convenience method to get a boolean setting
   */
  getBooleanSetting(key: string): Observable<boolean> {
    return this.apiService.get<boolean>(`${apiRoutes.SYSTEM_SETTINGS}/${key}`);
  }

  /**
   * Convenience method to set a boolean setting
   */
  setBooleanSetting(key: string, value: boolean, category?: string, description?: string): Observable<any> {
    const request = new SetSettingRequest({
      value: value.toString(),
      category: category,
      description: description
    });
    return this.setSetting(key, request);
  }

  /**
   * Convenience method to get an integer setting
   */
  getIntSetting(key: string): Observable<number> {
    return this.apiService.get<number>(`${apiRoutes.SYSTEM_SETTINGS}/${key}`);
  }

  /**
   * Convenience method to set an integer setting
   */
  setIntSetting(key: string, value: number, category?: string, description?: string): Observable<any> {
    const request = new SetSettingRequest({
      value: value.toString(),
      category: category,
      description: description
    });
    return this.setSetting(key, request);
  }

  /**
   * Convenience method to get a string setting
   */
  getStringSetting(key: string): Observable<string> {
    return this.apiService.get<string>(`${apiRoutes.SYSTEM_SETTINGS}/${key}`);
  }

  /**
   * Convenience method to set a string setting
   */
  setStringSetting(key: string, value: string, category?: string, description?: string): Observable<any> {
    const request = new SetSettingRequest({
      value: value,
      category: category,
      description: description
    });
    return this.setSetting(key, request);
  }
}
