import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { Notification, NotificationType } from '../../models/rom.model';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-bell.component.html',
  styleUrl: './notification-bell.component.scss'
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  isDropdownOpen = false;
  private subscription?: Subscription;
  
  // Expose enums and utilities to template
  NotificationType = NotificationType;
  Math = Math;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications.filter(n => !n.isDismissed);
      this.unreadCount = this.notificationService.unreadCount;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.markAllAsRead();
    }
  }

  markAsRead(notification: Notification): void {
    this.notificationService.markAsRead(notification.id);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  dismissNotification(notification: Notification): void {
    this.notificationService.dismissNotification(notification.id);
  }

  dismissAll(): void {
    this.notificationService.dismissAll();
  }

  getNotificationIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.Success:
      case NotificationType.ScanComplete:
        return 'fas fa-check-circle';
      case NotificationType.Error:
      case NotificationType.ScanError:
        return 'fas fa-exclamation-circle';
      case NotificationType.Warning:
        return 'fas fa-exclamation-triangle';
      case NotificationType.ScanProgress:
        return 'fas fa-spinner fa-spin';
      case NotificationType.Info:
      default:
        return 'fas fa-info-circle';
    }
  }

  getNotificationClass(type: NotificationType): string {
    switch (type) {
      case NotificationType.Success:
      case NotificationType.ScanComplete:
        return 'text-success';
      case NotificationType.Error:
      case NotificationType.ScanError:
        return 'text-danger';
      case NotificationType.Warning:
        return 'text-warning';
      case NotificationType.ScanProgress:
        return 'text-primary';
      case NotificationType.Info:
      default:
        return 'text-info';
    }
  }

  formatTimestamp(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return timestamp.toLocaleDateString();
  }

  getProgressBarWidth(notification: Notification): string {
    if (notification.type === NotificationType.ScanProgress && notification.data?.progress !== undefined) {
      return `${Math.min(100, Math.max(0, notification.data.progress))}%`;
    }
    return '0%';
  }

  executeAction(notification: Notification, actionIndex: number): void {
    if (notification.actions && notification.actions[actionIndex]) {
      notification.actions[actionIndex].action();
    }
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  trackByNotificationId(index: number, notification: Notification): string {
    return notification.id;
  }
}
