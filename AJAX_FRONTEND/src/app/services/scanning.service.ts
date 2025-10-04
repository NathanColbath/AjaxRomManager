import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, apiRoutes } from './api.service';
import { 
  ScanJob, 
  ScanProgress, 
  ScanConfiguration, 
  StartScanRequest, 
  RecurringScanRequest,
  ScanHistoryRequest,
  PagedResult 
} from '../models/rom.model';

@Injectable({
  providedIn: 'root'
})
export class ScanningService {

  constructor(private apiService: ApiService) {}

  // Start a new scan
  startScan(request: StartScanRequest): Observable<ScanJob> {
    return this.apiService.post<ScanJob>(apiRoutes.SCANNING_START, request);
  }

  // Start a recurring scan
  startRecurringScan(request: RecurringScanRequest): Observable<ScanJob> {
    return this.apiService.post<ScanJob>(apiRoutes.SCANNING_START_RECURRING, request);
  }

  // Start a daily recurring scan (convenience method)
  startDailyScan(directoryPath: string, platformId?: number): Observable<ScanJob> {
    const request = new RecurringScanRequest({
      directoryPath,
      platformId,
      cronExpression: '0 2 * * *', // Daily at 2 AM
      name: `Daily scan - ${directoryPath}`
    });
    return this.startRecurringScan(request);
  }

  // Stop a scan
  stopScan(scanJobId: number): Observable<void> {
    return this.apiService.delete<void>(`${apiRoutes.SCANNING_STOP}/${scanJobId}`);
  }

  // Get active scans
  getActiveScans(): Observable<ScanJob[]> {
    return this.apiService.get<ScanJob[]>(apiRoutes.SCANNING_ACTIVE);
  }

  // Get scan progress for a specific scan
  getScanProgress(scanJobId: number): Observable<ScanProgress> {
    return this.apiService.get<ScanProgress>(`${apiRoutes.SCANNING_PROGRESS}/${scanJobId}/progress`);
  }

  // Get scan history with pagination
  getScanHistory(request: ScanHistoryRequest): Observable<PagedResult<ScanJob>> {
    const params = {
      page: request.page.toString(),
      pageSize: request.pageSize.toString(),
      ...(request.platformId && { platformId: request.platformId.toString() }),
      ...(request.status && { status: request.status }),
      ...(request.fromDate && { fromDate: request.fromDate.toISOString() }),
      ...(request.toDate && { toDate: request.toDate.toISOString() })
    };
    return this.apiService.getWithParams<PagedResult<ScanJob>>(apiRoutes.SCANNING_HISTORY, params);
  }

  // Get scan history page (convenience method)
  getScanHistoryPage(page: number = 1, pageSize: number = 20): Observable<PagedResult<ScanJob>> {
    const request = new ScanHistoryRequest({ page, pageSize });
    return this.getScanHistory(request);
  }

  // Get scan configuration
  getScanConfiguration(): Observable<ScanConfiguration> {
    return this.apiService.get<ScanConfiguration>(apiRoutes.SCANNING_SETTINGS);
  }

  // Update scan configuration
  updateScanConfiguration(config: ScanConfiguration): Observable<ScanConfiguration> {
    return this.apiService.put<ScanConfiguration>(apiRoutes.SCANNING_SETTINGS, config);
  }

  // Set default scan directory
  setScanDirectory(directoryPath: string): Observable<void> {
    return this.apiService.put<void>(apiRoutes.SCANNING_DIRECTORY, { directoryPath });
  }

  // Get scan statistics
  getScanStatistics(): Observable<any> {
    return this.apiService.get<any>(`${apiRoutes.SCANNING}/statistics`);
  }

  // Get scan by ID
  getScanJob(scanJobId: number): Observable<ScanJob> {
    return this.apiService.get<ScanJob>(`${apiRoutes.SCANNING}/${scanJobId}`);
  }

  // Cancel a scan
  cancelScan(scanJobId: number): Observable<void> {
    return this.apiService.put<void>(`${apiRoutes.SCANNING}/${scanJobId}/cancel`, {});
  }

  // Retry a failed scan
  retryScan(scanJobId: number): Observable<ScanJob> {
    return this.apiService.post<ScanJob>(`${apiRoutes.SCANNING}/${scanJobId}/retry`, {});
  }

  // Delete a scan job
  deleteScanJob(scanJobId: number): Observable<void> {
    return this.apiService.delete<void>(`${apiRoutes.SCANNING}/${scanJobId}`);
  }

  // Get scan logs for a specific scan
  getScanLogs(scanJobId: number): Observable<string[]> {
    return this.apiService.get<string[]>(`${apiRoutes.SCANNING}/${scanJobId}/logs`);
  }
}