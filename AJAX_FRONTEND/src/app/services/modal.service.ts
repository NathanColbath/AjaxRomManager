import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { ModalConfig } from '../components/modal/modal.component';

export interface ModalResult {
  confirmed: boolean;
  value?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalSubject = new BehaviorSubject<ModalConfig | null>(null);
  private resultSubject = new Subject<ModalResult>();

  /**
   * Shows an info modal
   */
  showInfo(title: string, message: string): Observable<ModalResult> {
    return this.showModal({
      title,
      message,
      type: 'info',
      showCancel: false,
      confirmText: 'OK'
    });
  }

  /**
   * Shows a success modal
   */
  showSuccess(title: string, message: string): Observable<ModalResult> {
    return this.showModal({
      title,
      message,
      type: 'success',
      showCancel: false,
      confirmText: 'OK'
    });
  }

  /**
   * Shows a warning modal
   */
  showWarning(title: string, message: string): Observable<ModalResult> {
    return this.showModal({
      title,
      message,
      type: 'warning',
      showCancel: false,
      confirmText: 'OK'
    });
  }

  /**
   * Shows an error modal
   */
  showError(title: string, message: string): Observable<ModalResult> {
    return this.showModal({
      title,
      message,
      type: 'error',
      showCancel: false,
      confirmText: 'OK'
    });
  }

  /**
   * Shows a confirmation modal
   */
  showConfirm(title: string, message: string, confirmText: string = 'Confirm', cancelText: string = 'Cancel'): Observable<ModalResult> {
    return this.showModal({
      title,
      message,
      type: 'confirm',
      showCancel: true,
      confirmText,
      cancelText
    });
  }

  /**
   * Shows a prompt modal for user input
   */
  showPrompt(
    title: string, 
    message: string, 
    placeholder: string = '', 
    defaultValue: string = '',
    inputType: 'text' | 'password' | 'email' | 'number' = 'text',
    maxLength?: number,
    required: boolean = false
  ): Observable<ModalResult> {
    return this.showModal({
      title,
      message,
      type: 'prompt',
      showCancel: true,
      confirmText: 'OK',
      cancelText: 'Cancel',
      inputPlaceholder: placeholder,
      inputValue: defaultValue,
      inputType,
      maxLength,
      required
    });
  }

  /**
   * Shows a custom modal with full configuration
   */
  showModal(config: ModalConfig): Observable<ModalResult> {
    this.modalSubject.next(config);
    return this.resultSubject.asObservable();
  }

  /**
   * Closes the current modal
   */
  closeModal(): void {
    this.modalSubject.next(null);
  }

  /**
   * Gets the current modal configuration
   */
  getCurrentModal(): Observable<ModalConfig | null> {
    return this.modalSubject.asObservable();
  }

  /**
   * Emits a result and closes the modal
   */
  emitResult(result: ModalResult): void {
    this.resultSubject.next(result);
    this.closeModal();
  }

  // Convenience methods that match browser APIs
  alert(message: string, title: string = 'Alert'): Observable<ModalResult> {
    return this.showInfo(title, message);
  }

  confirm(message: string, title: string = 'Confirm'): Observable<ModalResult> {
    return this.showConfirm(title, message);
  }

  prompt(message: string, defaultValue: string = '', title: string = 'Prompt'): Observable<ModalResult> {
    return this.showPrompt(title, message, '', defaultValue);
  }
}