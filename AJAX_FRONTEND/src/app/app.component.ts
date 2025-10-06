import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { NotificationIntegrationService } from './services/notification-integration.service';
import { ModalContainerComponent } from './components/modal-container/modal-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ModalContainerComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="container-fluid">
      <router-outlet></router-outlet>
    </div>
    <app-modal-container></app-modal-container>
  `,
  styles: []
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Ajax Rom Manager';

  constructor(private notificationIntegration: NotificationIntegrationService) {}

  ngOnInit(): void {
    // Initialize the notification integration service
    this.notificationIntegration.ngOnInit();
  }

  ngOnDestroy(): void {
    this.notificationIntegration.ngOnDestroy();
  }
}

