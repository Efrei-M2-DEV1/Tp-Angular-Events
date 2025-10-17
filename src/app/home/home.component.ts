import { Component, OnInit } from '@angular/core';
import { Event } from '../core/models/event.model';
import { EventService } from '../core/services/event.service';
import { CategoryService } from '../core/services/category.service';
import { Category } from '../core/models/category.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  featuredEvents: Event[] = [];
  upcomingEvents: Event[] = [];
  categories: Category[] = [];
  isLoading = true;

  constructor(
    private eventService: EventService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        console.log('Catégories chargées:', categories);
        this.loadEvents();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des catégories:', error);
        this.loadEvents();
      }
    });
  }

  private loadEvents(): void {
    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        console.log('Événements chargés:', events);
        console.log('Catégories disponibles:', this.categories);
        this.featuredEvents = events.slice(0, 2);
        this.upcomingEvents = events.slice(2, 4);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des événements:', error);
        this.isLoading = false;
      }
    });
  }

  onEventSelected(event: Event): void {
    console.log('Événement sélectionné:', event);
  }

  onEventDeleted(eventId: number): void {
    this.eventService.deleteEvent(eventId).subscribe({
      next: () => {
        this.featuredEvents = this.featuredEvents.filter(e => e.id !== eventId);
        this.upcomingEvents = this.upcomingEvents.filter(e => e.id !== eventId);
        console.log('Événement supprimé avec succès');
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
      }
    });
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Non catégorisé';
  }

  getCategoryColor(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.color : '#666';
  }
}
