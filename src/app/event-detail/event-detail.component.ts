import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EventService } from '../core/services/event.service';
import { CategoryService } from '../core/services/category.service';
import { AuthService } from '../core/services/auth.service';
import { Event } from '../core/models/event.model';
import { Category } from '../core/models/category.model';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private eventService: EventService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    const eventId = +this.route.snapshot.params['id'];
    this.loadEvent(eventId);
  }

  loadEvent(id: number): void {
    this.eventService.getEventById(id).subscribe({
      next: (event) => {
        this.event = event;
        if (event.categoryId) {
          this.loadCategory(event.categoryId);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'événement', error);
        this.isLoading = false;
        this.router.navigate(['/events']);
      }
    });
  }

  loadCategory(categoryId: number): void {
    this.categoryService.getCategoryById(categoryId).subscribe({
      next: (category) => {
        this.category = category;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la catégorie', error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/events']);
  }

  logout(): void {
    this.authService.logout();
  }
}
