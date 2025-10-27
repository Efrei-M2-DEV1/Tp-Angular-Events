import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EventService } from '../core/services/event.service';
import { CategoryService } from '../core/services/category.service';
import { Event } from '../core/models/event.model';
import { Category } from '../core/models/category.model';
import { NotificationService } from '../shared/notifications/notification.service';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit {
  event: Event | null = null;
  category: Category | null = null;
  isLoading = true;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventService = inject(EventService);
  private categoryService = inject(CategoryService);
  private notifications = inject(NotificationService);

  ngOnInit(): void {
    const idParam = this.route.snapshot.params['id'];
    const eventId: any = /^(\d+)$/.test(idParam) ? Number(idParam) : idParam;
    this.loadEvent(eventId);
  }

  loadEvent(id: string | number): void {
    this.eventService.getEventById(id).subscribe({
      next: (event) => {
        this.event = event;
        if (event.categoryId) {
          this.loadCategory(event.categoryId as any);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'événement', error);
        this.isLoading = false;
        this.notifications.error('Événement introuvable');
        this.router.navigate(['/home']);
      }
    });
  }

  loadCategory(categoryId: string | number): void {
    this.categoryService.getCategoryById(categoryId).subscribe({
      next: (category) => {
        this.category = category;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la catégorie', error);
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  isFull(): boolean {
    if (!this.event || !this.event.maxParticipants) return false;
    const current = this.event.currentParticipants || 0;
    return current >= this.event.maxParticipants;
  }

  onRegister(): void {
    if (!this.event?.id || this.isFull()) {
      this.notifications.error('Événement complet');
      return;
    }

    this.eventService.registerParticipant(this.event.id).subscribe({
      next: (updated) => {
        if (this.event) {
          this.event = { ...this.event, currentParticipants: updated.currentParticipants };
        }
        this.notifications.success('Inscription confirmée !');
      },
      error: (err) => {
        console.error('Inscription impossible:', err);
        this.notifications.error('Inscription impossible. Veuillez réessayer.');
      }
    });
  }

  onEdit(): void {
    if (this.event?.id) {
      this.router.navigate(['/event-form', this.event.id]);
    }
  }

  onDelete(): void {
    if (!this.event?.id) return;
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${this.event.title}" ?`)) {
      this.eventService.deleteEvent(this.event.id).subscribe({
        next: () => {
          this.notifications.success('Événement supprimé avec succès');
          this.router.navigate(['/home']);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.notifications.error('Impossible de supprimer l\'événement');
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
