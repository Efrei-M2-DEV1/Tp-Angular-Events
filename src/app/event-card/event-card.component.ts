import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Event } from '../core/models/event.model';
import { Category } from '../core/models/category.model';
import { EventService } from '../core/services/event.service';
import { HighlightDirective } from '../shared/directives/highlight.directive';
import { NotificationService } from '../shared/notifications/notification.service';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule, HighlightDirective],
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss']
})
export class EventCardComponent {
  @Input() event!: Event;
  @Input() showActions: boolean = true;
  @Input() categories: Category[] = [];
  @Output() eventSelected = new EventEmitter<Event>();
  @Output() eventDeleted = new EventEmitter<string | number>();
  @Output() eventEdited = new EventEmitter<Event>();
  @Output() eventUpdated = new EventEmitter<Event>();

  private eventService = inject(EventService);
  private notifications = inject(NotificationService);

  onEventClick(): void {
    this.eventSelected.emit(this.event);
  }

  onEditClick(event: MouseEvent): void {
    event.stopPropagation();
    this.eventEdited.emit(this.event);
  }

  onDeleteClick(event: MouseEvent): void {
    event.stopPropagation();
    if (this.event.id) {
      const confirmed = window.confirm('Voulez-vous vraiment supprimer cet événement ?');
      if (confirmed) {
        this.eventDeleted.emit(this.event.id);
      }
    }
  }

  onRegisterClick(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.event?.id) return;
    
    // Vérifier si complet et notifier
    const current = this.event.currentParticipants || 0;
    if (this.event.maxParticipants && current >= this.event.maxParticipants) {
      this.notifications.error('Événement complet', 4000);
      return;
    }
    
    this.eventService.registerParticipant(this.event.id).subscribe({
      next: (updated) => {
        // Mise à jour locale
        if (updated && updated.currentParticipants != null) {
          this.event = { ...this.event, currentParticipants: updated.currentParticipants } as Event;
        } else {
          this.event = { ...this.event, currentParticipants: (current + 1) } as Event;
        }
        this.eventUpdated.emit(this.event);
        this.notifications.success('Inscription confirmée !', 3000);
      },
      error: (err) => {
        console.error('Inscription impossible:', err);
        this.notifications.error('Inscription impossible. Veuillez réessayer.', 4000);
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  getCategoryName(categoryId?: string | number): string {
    if (!this.categories || this.categories.length === 0) {
      return 'Chargement...';
    }
    if (!categoryId) {
      return 'Non catégorisé';
    }
    const category = this.categories.find(c => {
      return c.id === categoryId || (typeof c.id === 'string' && String(c.id) === String(categoryId));
    });
    return category ? category.name : 'Non catégorisé';
  }

  getCategoryColor(categoryId?: string | number): string {
    if (!this.categories || this.categories.length === 0) {
      return '#666';
    }
    if (!categoryId) {
      return '#666';
    }
    const category = this.categories.find(c => {
      return c.id === categoryId || (typeof c.id === 'string' && String(c.id) === String(categoryId));
    });
    return category ? category.color : '#666';
  }
}
