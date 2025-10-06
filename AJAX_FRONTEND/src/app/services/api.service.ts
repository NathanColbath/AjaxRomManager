import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notification } from '../models/rom.model';
import { NotificationService } from './notification.service';

@Injectable({
    providedIn: 'root'
})

export class apiRoutes {
    public static readonly ROMS = 'roms';
    public static readonly ROMS_METADATA = 'roms/metadata';
    public static readonly ROMS_UPLOAD = 'roms/upload';
    public static readonly ROMS_UPLOAD_MULTIPLE = 'roms/upload-multiple';
    public static readonly PLATFORMS = 'platforms';
    public static readonly PLATFORMS_METADATA = 'platforms/metadata';
    public static readonly SYSTEMS = 'systems';
    public static readonly METADATA = 'metadata';
    
    // Scanning endpoints
    public static readonly SCANNING = 'scanning';
    public static readonly SCANNING_START = 'scanning/start';
    public static readonly SCANNING_START_RECURRING = 'scanning/start-recurring';
    public static readonly SCANNING_STOP = 'scanning';
    public static readonly SCANNING_ACTIVE = 'scanning/active';
    public static readonly SCANNING_HISTORY = 'scanning/history';
    public static readonly SCANNING_PROGRESS = 'scanning';
    public static readonly SCANNING_SETTINGS = 'scanning/settings';
    public static readonly SCANNING_DIRECTORY = 'scanning/directory';
    
    // System Settings endpoints
    public static readonly SYSTEM_SETTINGS = 'systemsettings';
    public static readonly SYSTEM_SETTINGS_SCAN_CONFIG = 'systemsettings/scan/configuration';
    public static readonly SYSTEM_SETTINGS_SCAN_DIRECTORY = 'systemsettings/scan/directory';
    
    // File Upload endpoints
    public static readonly FILE_UPLOAD = 'fileupload';
    public static readonly FILE_UPLOAD_PLATFORM_LOGO = 'fileupload/platform-logo';
}


@Injectable({
    providedIn: 'root'
})
export class ApiService {
    public apiUrl = 'http://localhost:5005/api';
    constructor(private http: HttpClient, private notificationService: NotificationService) {}

    public post<T>(url: string, data: any): Observable<T> {
    
        return this.http.post<T>(`${this.apiUrl}/${url}`, data);
    }

    public get<T>(url: string): Observable<T> {
        return this.http.get<T>(`${this.apiUrl}/${url}`);
    }

    public put<T>(url: string, data: any): Observable<T> {
        return this.http.put<T>(`${this.apiUrl}/${url}`, data);
    }

    public delete<T>(url: string): Observable<T> {
        return this.http.delete<T>(`${this.apiUrl}/${url}`);
    }

    // Convenience method for GET requests with query parameters
    public getWithParams<T>(url: string, params: any): Observable<T> {
        return this.http.get<T>(`${this.apiUrl}/${url}`, { params });
    }

    // Method for GET requests that return text instead of JSON
    public getText(url: string): Observable<string> {
        return this.http.get(`${this.apiUrl}/${url}`, { responseType: 'text' });
    }

}1