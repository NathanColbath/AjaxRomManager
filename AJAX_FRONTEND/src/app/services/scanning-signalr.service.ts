import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { ScanProgressMessage, ScanProgress } from '../models/rom.model';

@Injectable({
  providedIn: 'root'
})
export class ScanningSignalRService {
  private connection: signalR.HubConnection | null = null;
  private isConnected = false;

  constructor() {}

  async startConnection(): Promise<void> {
    if (this.connection && this.isConnected) {
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5005/scanningHub')
      .withAutomaticReconnect()
      .build();

    try {
      await this.connection.start();
      this.isConnected = true;
      console.log('SignalR connection started');
    } catch (error) {
      console.error('Error starting SignalR connection:', error);
      throw error;
    }
  }

  async stopConnection(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.isConnected = false;
      this.connection = null;
      console.log('SignalR connection stopped');
    }
  }

  async joinScanGroup(scanJobId: number): Promise<void> {
    if (this.connection && this.isConnected) {
      await this.connection.invoke('JoinScanGroup', scanJobId);
    }
  }

  async leaveScanGroup(scanJobId: number): Promise<void> {
    if (this.connection && this.isConnected) {
      await this.connection.invoke('LeaveScanGroup', scanJobId);
    }
  }

  async joinAllScansGroup(): Promise<void> {
    if (this.connection && this.isConnected) {
      await this.connection.invoke('JoinAllScansGroup');
    }
  }

  async leaveAllScansGroup(): Promise<void> {
    if (this.connection && this.isConnected) {
      await this.connection.invoke('LeaveAllScansGroup');
    }
  }

  onScanStarted(callback: (message: ScanProgressMessage) => void): void {
    if (this.connection) {
      this.connection.on('ScanStarted', callback);
    }
  }

  onScanProgress(callback: (message: ScanProgressMessage) => void): void {
    if (this.connection) {
      this.connection.on('ScanProgress', callback);
    }
  }

  onScanCompleted(callback: (message: ScanProgressMessage) => void): void {
    if (this.connection) {
      this.connection.on('ScanCompleted', callback);
    }
  }

  onScanFailed(callback: (message: ScanProgressMessage) => void): void {
    if (this.connection) {
      this.connection.on('ScanFailed', callback);
    }
  }

  onScanCancelled(callback: (message: ScanProgressMessage) => void): void {
    if (this.connection) {
      this.connection.on('ScanCancelled', callback);
    }
  }

  onScanJobCreated(callback: (message: ScanProgressMessage) => void): void {
    if (this.connection) {
      this.connection.on('ScanJobCreated', callback);
    }
  }

  offScanStarted(): void {
    if (this.connection) {
      this.connection.off('ScanStarted');
    }
  }

  offScanProgress(): void {
    if (this.connection) {
      this.connection.off('ScanProgress');
    }
  }

  offScanCompleted(): void {
    if (this.connection) {
      this.connection.off('ScanCompleted');
    }
  }

  offScanFailed(): void {
    if (this.connection) {
      this.connection.off('ScanFailed');
    }
  }

  offScanCancelled(): void {
    if (this.connection) {
      this.connection.off('ScanCancelled');
    }
  }

  offScanJobCreated(): void {
    if (this.connection) {
      this.connection.off('ScanJobCreated');
    }
  }

  getConnectionState(): signalR.HubConnectionState | null {
    return this.connection?.state || null;
  }

  isConnectionActive(): boolean {
    return this.isConnected && this.connection?.state === signalR.HubConnectionState.Connected;
  }
}