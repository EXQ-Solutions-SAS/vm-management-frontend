import { Injectable, signal } from '@angular/core';

export interface Toast {
  message: string;
  type: 'success' | 'error';
  id: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);

  show(message: string, type: 'success' | 'error' = 'success') {
    const id = Date.now();
    this.toasts.update(t => [...t, { id, message, type }]);
    
    // Auto-eliminar después de 3 segundos
    setTimeout(() => {
      this.toasts.update(t => t.filter(toast => toast.id !== id));
    }, 3000);
  }
}