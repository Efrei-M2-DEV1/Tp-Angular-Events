import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../core/services/event.service';
import { Event } from '../core/models/event.model';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.scss']
})
export class ReservationsComponent implements OnInit {
  reservations: Event[] = [];
  isLoading = true;

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    // TODO: Implémenter la logique pour récupérer les événements auxquels l'utilisateur est inscrit
    // Pour l'instant, on récupère tous les événements
    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        this.reservations = events;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des réservations:', error);
        this.isLoading = false;
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
