import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Event } from '../core/models/event.model';
import { EventService } from '../core/services/event.service';
import { CategoryService } from '../core/services/category.service';
import { Category } from '../core/models/category.model';
import { EventCardComponent } from '../event-card/event-card.component';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, EventCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  featuredEvents: Event[] = [];
  upcomingEvents: Event[] = [];
  pastEvents: Event[] = [];
  categories: Category[] = [];
  isLoading = true;
  private routerSubscription?: Subscription;

  constructor(
    private eventService: EventService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
    
    // Recharger les données quand on revient sur /home
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url === '/home') {
          this.loadData();
        }
      });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
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
        const now = new Date();
        // Trier par date (les plus récents en premier)
        const sortedEvents = events.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        // Séparer les événements passés et à venir
        const upcoming: Event[] = [];
        const past: Event[] = [];
        for (const evt of sortedEvents) {
          if (new Date(evt.date) < now) {
            past.push(evt);
          } else {
            upcoming.push(evt);
          }
        }
        // Afficher les 2 premiers à venir comme "en vedette", le reste comme "à venir"
        this.featuredEvents = upcoming.slice(0, 2);
        this.upcomingEvents = upcoming.slice(2);
        this.pastEvents = past;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des événements:', error);
        this.isLoading = false;
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
        this.featuredEvents = this.featuredEvents.filter(e => e.id !== eventId);
        this.upcomingEvents = this.upcomingEvents.filter(e => e.id !== eventId);
        this.pastEvents = this.pastEvents.filter(e => e.id !== eventId);
        console.log('Événement supprimé avec succès');
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
      }
    });
  }

  onEventEdited(event: Event): void {
    if (event.id != null) {
      this.router.navigate(['/event-form', event.id]);
    } else {
      // Fallback to state navigation if id missing
      this.router.navigate(['/event-form'], { state: { event } });
    }
  }

  onEventUpdated(updated: Event): void {
    const updateList = (list: Event[]) => list.map(e => (e.id === updated.id ? { ...e, ...updated } : e));
    this.featuredEvents = updateList(this.featuredEvents);
    this.upcomingEvents = updateList(this.upcomingEvents);
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Non catégorisé';
  }

  getCategoryColor(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.color : '#666';
  }

  onCreateEvent(): void {
    this.router.navigate(['/event-form']);
  }
}
