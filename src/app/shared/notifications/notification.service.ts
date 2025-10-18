import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';

export interface Toast {
  id: number;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  timeout?: number; // ms
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$: Observable<Toast[]> = this.toastsSubject.asObservable();
  private counter = 0;

  show(message: string, type: Toast['type'] = 'info', timeout = 3000) {
    const toast: Toast = { id: ++this.counter, type, message, timeout };
    const current = this.toastsSubject.getValue();
    this.toastsSubject.next([...current, toast]);

    if (timeout && timeout > 0) {
      timer(timeout).subscribe(() => this.dismiss(toast.id));
    }
  }

  success(message: string, timeout?: number) { this.show(message, 'success', timeout ?? 3000); }
  info(message: string, timeout?: number) { this.show(message, 'info', timeout ?? 3000); }
  warning(message: string, timeout?: number) { this.show(message, 'warning', timeout ?? 4000); }
  error(message: string, timeout?: number) { this.show(message, 'error', timeout ?? 5000); }

  dismiss(id: number) {
    const current = this.toastsSubject.getValue();
    this.toastsSubject.next(current.filter(t => t.id !== id));
  }

  clear() { this.toastsSubject.next([]); }
}
