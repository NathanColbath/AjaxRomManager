import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationDemoComponent } from '../components/notification-demo/notification-demo.component';

@Component({
  selector: 'app-test-notifications',
  standalone: true,
  imports: [CommonModule, NotificationDemoComponent],
  template: `
    <div class="container mt-4">
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h4 class="mb-0">Notification System Test</h4>
            </div>
            <div class="card-body">
              <p class="text-muted">
                Use the buttons below to test the notification system. 
                Click the bell icon in the navbar to view notifications.
              </p>
              <app-notification-demo></app-notification-demo>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class TestNotificationsComponent {}
