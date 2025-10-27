import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Toast } from './notification.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let t of toasts()" class="toast" [class]="'toast ' + t.type" (click)="dismiss(t.id)">
        <span class="message">{{ t.message }}</span>
      </div>
    </div>
  `,
  styles: [`
    .toast-container { position: fixed; top: 16px; right: 16px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; }
    .toast { padding: 10px 14px; border-radius: 6px; color: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.15); cursor: pointer; min-width: 220px; }
    .toast.success { background: #16a34a; }
    .toast.info { background: #2563eb; }
    .toast.warning { background: #d97706; }
    .toast.error { background: #dc2626; }
    .toast .message { font-size: 0.95rem; }
  `]
})
export class ToastContainerComponent {
  toasts = signal<Toast[]>([]);

  constructor(private notifications: NotificationService) {
    this.notifications.toasts$.subscribe(list => this.toasts.set(list));
  }

  dismiss(id: number) {
    this.notifications.dismiss(id);
  }
}
