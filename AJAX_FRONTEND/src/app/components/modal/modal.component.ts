import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ModalConfig {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'confirm' | 'prompt';
  showCancel?: boolean;
  cancelText?: string;
  confirmText?: string;
  inputPlaceholder?: string;
  inputValue?: string;
  inputType?: 'text' | 'password' | 'email' | 'number';
  maxLength?: number;
  required?: boolean;
}

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal fade" [class.show]="isVisible" [style.display]="isVisible ? 'block' : 'none'" 
         tabindex="-1" role="dialog" [attr.aria-hidden]="!isVisible">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <!-- Modal Header -->
          <div class="modal-header" [ngClass]="getHeaderClass()">
            <h5 class="modal-title">
              <i [ngClass]="getIconClass()" class="me-2"></i>
              {{ config.title }}
            </h5>
            <button type="button" class="btn-close" (click)="onCancel()" aria-label="Close"></button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <p class="mb-3" [innerHTML]="config.message"></p>
            
            <!-- Input field for prompt modals -->
            <div *ngIf="config.type === 'prompt'" class="mb-3">
              <label *ngIf="config.inputPlaceholder" class="form-label">{{ config.inputPlaceholder }}</label>
              <input 
                type="{{ config.inputType || 'text' }}"
                class="form-control"
                [(ngModel)]="inputValue"
                [placeholder]="config.inputPlaceholder"
                [maxlength]="config.maxLength || null"
                [required]="config.required || false"
                #inputField
                (keyup.enter)="onConfirm()"
                (keyup.escape)="onCancel()">
              <div *ngIf="config.maxLength" class="form-text">
                {{ inputValue.length }}/{{ config.maxLength }} characters
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer">
            <button 
              *ngIf="config.showCancel !== false" 
              type="button" 
              class="btn btn-secondary" 
              (click)="onCancel()">
              {{ config.cancelText || 'Cancel' }}
            </button>
            <button 
              type="button" 
              class="btn" 
              [ngClass]="getConfirmButtonClass()"
              (click)="onConfirm()"
              [disabled]="isPromptInvalid()">
              {{ config.confirmText || getDefaultConfirmText() }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Backdrop -->
    <div *ngIf="isVisible" class="modal-backdrop fade show"></div>
  `,
  styles: [`
    .modal {
      z-index: 1055;
    }
    .modal-backdrop {
      z-index: 1050;
    }
    .modal.show {
      display: block !important;
    }
    .modal-backdrop.show {
      display: block !important;
    }
  `]
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() config: ModalConfig = {
    title: '',
    message: '',
    type: 'info'
  };
  
  @Output() confirmed = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  isVisible = false;
  inputValue = '';

  ngOnInit() {
    this.inputValue = this.config.inputValue || '';
    this.isVisible = true;
    
    // Focus input field for prompt modals
    setTimeout(() => {
      const inputField = document.querySelector('input[type="text"], input[type="password"], input[type="email"], input[type="number"]') as HTMLInputElement;
      if (inputField) {
        inputField.focus();
        inputField.select();
      }
    }, 100);

    // Prevent body scroll
    document.body.classList.add('modal-open');
  }

  ngOnDestroy() {
    // Restore body scroll
    document.body.classList.remove('modal-open');
  }

  onConfirm() {
    if (this.isPromptInvalid()) return;
    
    const result = this.config.type === 'prompt' ? this.inputValue : true;
    this.confirmed.emit(result);
    this.close();
  }

  onCancel() {
    this.cancelled.emit();
    this.close();
  }

  close() {
    this.isVisible = false;
    this.closed.emit();
  }

  getHeaderClass(): string {
    switch (this.config.type) {
      case 'success': return 'bg-success text-white';
      case 'warning': return 'bg-warning text-dark';
      case 'error': return 'bg-danger text-white';
      case 'confirm': return 'bg-primary text-white';
      case 'prompt': return 'bg-info text-white';
      default: return 'bg-light text-dark';
    }
  }

  getIconClass(): string {
    switch (this.config.type) {
      case 'success': return 'fas fa-check-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      case 'error': return 'fas fa-times-circle';
      case 'confirm': return 'fas fa-question-circle';
      case 'prompt': return 'fas fa-edit';
      default: return 'fas fa-info-circle';
    }
  }

  getConfirmButtonClass(): string {
    switch (this.config.type) {
      case 'success': return 'btn-success';
      case 'warning': return 'btn-warning';
      case 'error': return 'btn-danger';
      case 'confirm': return 'btn-primary';
      case 'prompt': return 'btn-info';
      default: return 'btn-primary';
    }
  }

  getDefaultConfirmText(): string {
    switch (this.config.type) {
      case 'confirm': return 'Confirm';
      case 'prompt': return 'OK';
      default: return 'OK';
    }
  }

  isPromptInvalid(): boolean {
    if (this.config.type !== 'prompt') return false;
    if (this.config.required && !this.inputValue.trim()) return true;
    return false;
  }
}
