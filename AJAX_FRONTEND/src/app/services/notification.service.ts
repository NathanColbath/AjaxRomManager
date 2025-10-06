import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Notification, NotificationType, NotificationAction } from '../models/rom.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private maxNotifications = 50;
  private autoDismissDelay = 5000; // 5 seconds default

  constructor() {}

  /**
   * Get observable stream of notifications
   */
  get notifications$(): Observable<Notification[]> {
    return this.notificationsSubject.asObservable();
  }

  /**
   * Get current notifications array
   */
  get notifications(): Notification[] {
    return this.notificationsSubject.value;
  }

  /**
   * Get unread notifications count
   */
  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead && !n.isDismissed).length;
  }

  /**
   * Add a new notification
   */
  addNotification(notification: Partial<Notification>): string {
    const newNotification = new Notification({
      id: this.generateId(),
      timestamp: new Date(),
      duration: notification.duration ?? this.autoDismissDelay,
      ...notification
    });

    const currentNotifications = this.notifications;
    const updatedNotifications = [newNotification, ...currentNotifications]
      .slice(0, this.maxNotifications); // Keep only the latest notifications

    this.notificationsSubject.next(updatedNotifications);

    // Auto-dismiss if duration is set and notification is not marked as persistent
    if (newNotification.duration && newNotification.duration > 0 && !notification.persistent) {
      setTimeout(() => {
        // Only auto-dismiss if still unread
        const currentNotification = this.notifications.find(n => n.id === newNotification.id);
        if (currentNotification && !currentNotification.isRead) {
          this.dismissNotification(newNotification.id);
        }
      }, newNotification.duration);
    }

    return newNotification.id;
  }

  /**
   * Add a success notification
   */
  showSuccess(title: string, message: string, duration?: number): string {
    return this.addNotification({
      type: NotificationType.Success,
      title,
      message,
      duration: duration ?? this.autoDismissDelay
    });
  }

  /**
   * Add a persistent success notification (won't auto-dismiss until read)
   */
  showPersistentSuccess(title: string, message: string): string {
    return this.addNotification({
      type: NotificationType.Success,
      title,
      message,
      duration: 0,
      persistent: true
    });
  }

  /**
   * Add an error notification
   */
  showError(title: string, message: string, duration?: number): string {
    return this.addNotification({
      type: NotificationType.Error,
      title,
      message,
      duration: duration ?? (this.autoDismissDelay * 2) // Errors stay longer
    });
  }

  /**
   * Add a persistent error notification (won't auto-dismiss until read)
   */
  showPersistentError(title: string, message: string): string {
    return this.addNotification({
      type: NotificationType.Error,
      title,
      message,
      duration: 0,
      persistent: true
    });
  }

  /**
   * Add a warning notification
   */
  showWarning(title: string, message: string, duration?: number): string {
    return this.addNotification({
      type: NotificationType.Warning,
      title,
      message,
      duration: duration ?? (this.autoDismissDelay * 1.5)
    });
  }

  /**
   * Add a persistent warning notification (won't auto-dismiss until read)
   */
  showPersistentWarning(title: string, message: string): string {
    return this.addNotification({
      type: NotificationType.Warning,
      title,
      message,
      duration: 0,
      persistent: true
    });
  }

  /**
   * Add an info notification
   */
  showInfo(title: string, message: string, duration?: number): string {
    return this.addNotification({
      type: NotificationType.Info,
      title,
      message,
      duration: duration ?? this.autoDismissDelay
    });
  }

  /**
   * Add a persistent info notification (won't auto-dismiss until read)
   */
  showPersistentInfo(title: string, message: string): string {
    return this.addNotification({
      type: NotificationType.Info,
      title,
      message,
      duration: 0,
      persistent: true
    });
  }

  /**
   * Add a scan progress notification
   */
  showScanProgress(scanJobId: number, message: string, progress?: number): string {
    const existingNotification = this.notifications.find(n => 
      n.type === NotificationType.ScanProgress && n.data?.scanJobId === scanJobId
    );

    if (existingNotification) {
      // Update existing notification
      existingNotification.message = message;
      if (progress !== undefined) {
        existingNotification.data = { ...existingNotification.data, progress };
      }
      this.notificationsSubject.next([...this.notifications]);
      return existingNotification.id;
    } else {
      // Create new notification
      return this.addNotification({
        type: NotificationType.ScanProgress,
        title: 'Scan in Progress',
        message,
        duration: 0, // Don't auto-dismiss progress notifications
        data: { scanJobId, progress }
      });
    }
  }

  /**
   * Add a scan completion notification
   */
  showScanComplete(scanJobId: number, message: string, filesAdded?: number): string {
    // Remove any existing progress notification for this scan
    this.removeNotificationsByType(NotificationType.ScanProgress, scanJobId);

    return this.addNotification({
      type: NotificationType.ScanComplete,
      title: 'Scan Completed',
      message,
      duration: this.autoDismissDelay * 3, // Success notifications stay longer
      data: { scanJobId, filesAdded }
    });
  }

  /**
   * Add a scan error notification
   */
  showScanError(scanJobId: number, message: string, error?: string): string {
    // Remove any existing progress notification for this scan
    this.removeNotificationsByType(NotificationType.ScanProgress, scanJobId);

    return this.addNotification({
      type: NotificationType.ScanError,
      title: 'Scan Failed',
      message,
      duration: this.autoDismissDelay * 4, // Error notifications stay longest
      data: { scanJobId, error }
    });
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      this.notificationsSubject.next([...this.notifications]);
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.notifications.forEach(notification => {
      notification.isRead = true;
    });
    this.notificationsSubject.next([...this.notifications]);
  }

  /**
   * Dismiss a specific notification
   */
  dismissNotification(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isDismissed = true;
      this.notificationsSubject.next([...this.notifications]);
    }
  }

  /**
   * Dismiss all notifications
   */
  dismissAll(): void {
    this.notifications.forEach(notification => {
      notification.isDismissed = true;
    });
    this.notificationsSubject.next([...this.notifications]);
  }

  /**
   * Remove a notification completely
   */
  removeNotification(notificationId: string): void {
    const updatedNotifications = this.notifications.filter(n => n.id !== notificationId);
    this.notificationsSubject.next(updatedNotifications);
  }

  /**
   * Remove all notifications
   */
  clearAll(): void {
    this.notificationsSubject.next([]);
  }

  /**
   * Remove notifications by type and optional scan job ID
   */
  private removeNotificationsByType(type: NotificationType, scanJobId?: number): void {
    const updatedNotifications = this.notifications.filter(n => {
      if (n.type !== type) return true;
      if (scanJobId !== undefined && n.data?.scanJobId !== scanJobId) return true;
      return false;
    });
    this.notificationsSubject.next(updatedNotifications);
  }

  /**
   * Generate unique ID for notifications
   */
  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set auto-dismiss delay for new notifications
   */
  setAutoDismissDelay(delay: number): void {
    this.autoDismissDelay = delay;
  }

  /**
   * Set maximum number of notifications to keep
   */
  setMaxNotifications(max: number): void {
    this.maxNotifications = max;
    // Trim existing notifications if needed
    const currentNotifications = this.notifications;
    if (currentNotifications.length > max) {
      this.notificationsSubject.next(currentNotifications.slice(0, max));
    }
  }
}
