import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, apiRoutes } from './api.service';
import { 
  ScanJob, 
  ScanProgress, 
  ScanConfiguration, 
  StartScanRequest, 
  RecurringScanRequest, 
  SetDirectoryRequest, 
  ScanHistoryRequest, 
  PagedResult 
} from '../models/rom.model';

@Injectable({
  providedIn: 'root'
})
export class ScanningService {
  constructor(private apiService: ApiService) {}

  /**
   * Starts a new scan job for the specified directory
   */
  startScan(request: StartScanRequest): Observable<ScanJob> {
    return this.apiService.post<ScanJob>(apiRoutes.SCANNING_START, request);
  }

  /**
   * Starts a recurring scan job with the specified cron expression
   */
  startRecurringScan(request: RecurringScanRequest): Observable<ScanJob> {
    return this.apiService.post<ScanJob>(apiRoutes.SCANNING_START_RECURRING, request);
  }

  /**
   * Stops a running scan job
   */
  stopScan(scanJobId: number): Observable<any> {
    return this.apiService.post(`${apiRoutes.SCANNING_STOP}/${scanJobId}/stop`, {});
  }

  /**
   * Gets a specific scan job by ID
   */
  getScanJob(scanJobId: number): Observable<ScanJob> {
    return this.apiService.get<ScanJob>(`${apiRoutes.SCANNING}/${scanJobId}`);
  }

  /**
   * Gets all currently active scan jobs
   */
  getActiveScans(): Observable<ScanJob[]> {
    return this.apiService.get<ScanJob[]>(apiRoutes.SCANNING_ACTIVE);
  }

  /**
   * Gets scan job history with optional filtering
   */
  getScanHistory(request: ScanHistoryRequest): Observable<PagedResult<ScanJob>> {
    const params: any = {};
    
    if (request.platformId) params.platformId = request.platformId;
    if (request.page) params.page = request.page;
    if (request.pageSize) params.pageSize = request.pageSize;
    if (request.status) params.status = request.status;
    if (request.fromDate) params.fromDate = request.fromDate.toISOString();
    if (request.toDate) params.toDate = request.toDate.toISOString();

    return this.apiService.getWithParams<PagedResult<ScanJob>>(apiRoutes.SCANNING_HISTORY, params);
  }

  /**
   * Gets the current progress of a scan job
   */
  getScanProgress(scanJobId: number): Observable<ScanProgress> {
    return this.apiService.get<ScanProgress>(`${apiRoutes.SCANNING_PROGRESS}/${scanJobId}/progress`);
  }

  /**
   * Gets the current scan configuration settings
   */
  getScanSettings(): Observable<ScanConfiguration> {
    return this.apiService.get<ScanConfiguration>(apiRoutes.SCANNING_SETTINGS);
  }

  /**
   * Updates the scan configuration settings
   */
  updateScanSettings(config: ScanConfiguration): Observable<any> {
    return this.apiService.put(apiRoutes.SCANNING_SETTINGS, config);
  }

  /**
   * Gets the current default scan directory
   */
  getScanDirectory(): Observable<string> {
    return this.apiService.get<string>(apiRoutes.SCANNING_DIRECTORY);
  }

  /**
   * Sets the default scan directory
   */
  setScanDirectory(request: SetDirectoryRequest): Observable<any> {
    return this.apiService.put(apiRoutes.SCANNING_DIRECTORY, request);
  }

  /**
   * Convenience method to start a simple scan with just a directory path
   */
  startSimpleScan(directoryPath: string, platformId?: number): Observable<ScanJob> {
    const request = new StartScanRequest({
      directoryPath: directoryPath,
      platformId: platformId
    });
    return this.startScan(request);
  }

  /**
   * Convenience method to start a scan with custom options
   */
  startCustomScan(
    directoryPath: string, 
    options: Partial<{
      platformId: number;
      recursive: boolean;
      autoDetectPlatform: boolean;
      createMetadata: boolean;
      skipDuplicates: boolean;
      maxFileSizeMB: number;
      hashAlgorithm: string;
      includeSubdirectories: boolean;
      scanType: string;
    }>
  ): Observable<ScanJob> {
    const request = new StartScanRequest({
      directoryPath: directoryPath,
      platformId: options.platformId,
      options: {
        recursive: options.recursive ?? true,
        autoDetectPlatform: options.autoDetectPlatform ?? true,
        createMetadata: options.createMetadata ?? true,
        skipDuplicates: options.skipDuplicates ?? true,
        maxFileSizeBytes: (options.maxFileSizeMB ?? 1024) * 1024 * 1024,
        hashAlgorithm: options.hashAlgorithm ?? 'MD5',
        includeSubdirectories: options.includeSubdirectories ?? true,
        scanType: options.scanType ?? 'Full'
      }
    });
    return this.startScan(request);
  }

  /**
   * Convenience method to start a daily recurring scan
   */
  startDailyScan(directoryPath: string, platformId?: number): Observable<ScanJob> {
    const request = new RecurringScanRequest({
      directoryPath: directoryPath,
      cronExpression: 'daily',
      platformId: platformId
    });
    return this.startRecurringScan(request);
  }

  /**
   * Convenience method to start a weekly recurring scan
   */
  startWeeklyScan(directoryPath: string, platformId?: number): Observable<ScanJob> {
    const request = new RecurringScanRequest({
      directoryPath: directoryPath,
      cronExpression: 'weekly',
      platformId: platformId
    });
    return this.startRecurringScan(request);
  }

  /**
   * Convenience method to start a monthly recurring scan
   */
  startMonthlyScan(directoryPath: string, platformId?: number): Observable<ScanJob> {
    const request = new RecurringScanRequest({
      directoryPath: directoryPath,
      cronExpression: 'monthly',
      platformId: platformId
    });
    return this.startRecurringScan(request);
  }

  /**
   * Gets scan history with default pagination
   */
  getScanHistoryPage(page: number = 1, pageSize: number = 20): Observable<PagedResult<ScanJob>> {
    const request = new ScanHistoryRequest({
      page: page,
      pageSize: pageSize
    });
    return this.getScanHistory(request);
  }

  /**
   * Gets scan history filtered by platform
   */
  getScanHistoryByPlatform(platformId: number, page: number = 1, pageSize: number = 20): Observable<PagedResult<ScanJob>> {
    const request = new ScanHistoryRequest({
      platformId: platformId,
      page: page,
      pageSize: pageSize
    });
    return this.getScanHistory(request);
  }

  /**
   * Gets scan history filtered by status
   */
  getScanHistoryByStatus(status: string, page: number = 1, pageSize: number = 20): Observable<PagedResult<ScanJob>> {
    const request = new ScanHistoryRequest({
      status: status,
      page: page,
      pageSize: pageSize
    });
    return this.getScanHistory(request);
  }

  /**
   * Gets scan history filtered by date range
   */
  getScanHistoryByDateRange(fromDate: Date, toDate: Date, page: number = 1, pageSize: number = 20): Observable<PagedResult<ScanJob>> {
    const request = new ScanHistoryRequest({
      fromDate: fromDate,
      toDate: toDate,
      page: page,
      pageSize: pageSize
    });
    return this.getScanHistory(request);
  }
}
