import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Event } from '../core/models/event.model';
import { EventService } from '../core/services/event.service';
import { CategoryService } from '../core/services/category.service';
import { RoleService } from '../core/services/role.service';
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
  upcomingEvents: Event[] = [];
  pastEvents: Event[] = [];
  filteredUpcoming: Event[] = [];
  filteredPast: Event[] = [];
  categories: Category[] = [];
  isLoading = true;
  searchTerm = '';
  // Multi-select categories (store ids as string); empty array = all
  selectedCategories: string[] = [];
  private routerSubscription?: Subscription;

  constructor(
    private eventService: EventService,
    private categoryService: CategoryService,
    private router: Router,
    public roleService: RoleService
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
        const upcoming = events
          .filter(e => new Date(e.date) >= now)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const past = events
          .filter(e => new Date(e.date) < now)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.upcomingEvents = upcoming;
        this.pastEvents = past;
        this.applyFilters();
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
      this.router.navigate(['/event-form'], { state: { event } });
    }
  }

  onEventUpdated(updated: Event): void {
    const updateList = (list: Event[]) => list.map(e => (e.id === updated.id ? { ...e, ...updated } : e));
    this.upcomingEvents = updateList(this.upcomingEvents);
    this.pastEvents = updateList(this.pastEvents);
    this.applyFilters();
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

  onSearchChange(term: string): void {
    this.searchTerm = term.trim().toLowerCase();
    this.applyFilters();
  }

  toggleCategory(categoryId: string): void {
    const id = String(categoryId);
    if (this.selectedCategories.includes(id)) {
      this.selectedCategories = this.selectedCategories.filter(c => c !== id);
    } else {
      this.selectedCategories.push(id);
    }
    this.applyFilters();
  }

  removeCategory(categoryId: string, ev?: MouseEvent): void {
    if (ev) ev.stopPropagation();
    this.selectedCategories = this.selectedCategories.filter(c => c !== String(categoryId));
    this.applyFilters();
  }

  clearAllCategories(): void {
    this.selectedCategories = [];
    this.applyFilters();
  }

  isCategorySelected(categoryId: string | number): boolean {
    return this.selectedCategories.includes(String(categoryId));
  }

  private applyFilters(): void {
    const matches = (e: Event) => {
      const termOk = !this.searchTerm || e.title.toLowerCase().includes(this.searchTerm) || (e.description?.toLowerCase().includes(this.searchTerm));
      const catOk = this.selectedCategories.length === 0 || this.selectedCategories.includes(String(e.categoryId));
      return termOk && catOk;
    };
    this.filteredUpcoming = this.upcomingEvents.filter(matches);
    this.filteredPast = this.pastEvents.filter(matches);
  }
}
