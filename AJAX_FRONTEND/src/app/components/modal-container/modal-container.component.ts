import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService, ModalResult } from '../../services/modal.service';
import { ModalComponent, ModalConfig } from '../modal/modal.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modal-container',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  template: `
    <app-modal 
      *ngIf="currentConfig"
      [config]="currentConfig"
      (confirmed)="onConfirmed($event)"
      (cancelled)="onCancelled()"
      (closed)="onClosed()">
    </app-modal>
  `
})
export class ModalContainerComponent implements OnInit, OnDestroy {
  currentConfig: ModalConfig | null = null;
  private subscription: Subscription = new Subscription();

  constructor(private modalService: ModalService) {}

  ngOnInit() {
    // Subscribe to modal service to show/hide modals
    this.subscription.add(
      this.modalService.getCurrentModal().subscribe(config => {
        this.currentConfig = config;
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onConfirmed(value: any) {
    this.modalService.emitResult({ confirmed: true, value });
  }

  onCancelled() {
    this.modalService.emitResult({ confirmed: false });
  }

  onClosed() {
    this.modalService.emitResult({ confirmed: false });
  }
}
