import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Event } from '../core/models/event.model';
import { Category } from '../core/models/category.model';
import { EventService } from '../core/services/event.service';
import { RegistrationService } from '../core/services/registration.service';
import { RoleService } from '../core/services/role.service';
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
  private registrationService = inject(RegistrationService);
  private notifications = inject(NotificationService);
  public roleService = inject(RoleService);

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
    
    // Créer l'inscription dans le RegistrationService (localStorage)
    this.registrationService.registerToEvent(this.event.id).subscribe({
      next: (registration) => {
        console.log('event-card - Registration created:', registration);
        
        // Incrémenter le compteur de participants dans le backend
        this.eventService.registerParticipant(this.event.id!).subscribe({
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
            console.error('Erreur mise à jour compteur:', err);
            this.notifications.error('Erreur lors de la mise à jour du compteur', 4000);
          }
        });
      },
      error: (err) => {
        console.error('Inscription impossible:', err);
        if (err.message && err.message.includes('déjà inscrit')) {
          this.notifications.warning('Vous êtes déjà inscrit à cet événement', 4000);
        } else {
          this.notifications.error('Inscription impossible. Veuillez réessayer.', 4000);
        }
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
