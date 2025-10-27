import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { EventCardComponent } from '../event-card/event-card.component';
import { EventService } from '../core/services/event.service';
import { CategoryService } from '../core/services/category.service';
import { AuthService } from '../core/services/auth.service';
import { Event } from '../core/models/event.model';
import { Category } from '../core/models/category.model';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterModule, EventCardComponent],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit {
  events: Event[] = [];
  categories: Category[] = [];
  isLoading = true;

  constructor(
    private router: Router,
    private authService: AuthService,
    private eventService: EventService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadEvents();
    this.loadCategories();
  }

  loadEvents(): void {
    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des événements', error);
        this.isLoading = false;
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des catégories', error);
      }
    });
  }

  onEventSelected(event: Event): void {
    if (event.id) {
      this.router.navigate(['/event', event.id]);
    }
  }

  onEventDeleted(eventId: string | number): void {
    this.eventService.deleteEvent(eventId).subscribe({
      next: () => {
        this.events = this.events.filter(e => e.id !== eventId);
        console.log('Événement supprimé avec succès');
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
