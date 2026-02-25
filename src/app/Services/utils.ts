import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UtilsService {
  toastVisible = signal(false);
  toastMessage = signal('');
  toastType = signal<'success' | 'error' | 'info'>('info');

  confirmIsOpen = signal(false);
  confirmTitle = signal('');
  confirmMessage = signal('');
  confirmCallback: () => void = () => {};

  showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.toastVisible.set(true);
    setTimeout(() => this.toastVisible.set(false), 3000);
  }

  openConfirm(title: string, message: string, onConfirm: () => void) {
    this.confirmTitle.set(title);
    this.confirmMessage.set(message);
    this.confirmCallback = onConfirm;
    this.confirmIsOpen.set(true);
  }

  closeConfirm() {
    this.confirmIsOpen.set(false);
  }

  confirm() {
    this.confirmCallback();
    this.closeConfirm();
  }
}