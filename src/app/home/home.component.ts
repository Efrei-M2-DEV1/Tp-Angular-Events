import { Component, OnInit } from '@angular/core';
import { Event } from '../core/models/event.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  featuredEvents: Event[] = [];
  upcomingEvents: Event[] = [];

  constructor() {}

  ngOnInit(): void {
    this.loadFeaturedEvents();
    this.loadUpcomingEvents();
  }

  private loadFeaturedEvents(): void {
    this.featuredEvents = [
      {
        id: 1,
        title: 'Conférence Angular 2024',
        description: 'Découvrez les dernières fonctionnalités d\'Angular avec des experts de la communauté.',
        date: '2024-12-15',
        location: 'Paris, France',
        categoryId: 1
      },
      {
        id: 2,
        title: 'Workshop TypeScript',
        description: 'Apprenez TypeScript de A à Z avec des exercices pratiques et des projets concrets.',
        date: '2024-12-20',
        location: 'Lyon, France',
        categoryId: 2
      }
    ];
  }

  private loadUpcomingEvents(): void {
    this.upcomingEvents = [
      {
        id: 3,
        title: 'Meetup Développeurs',
        description: 'Rencontrez d\'autres développeurs et partagez vos expériences.',
        date: '2024-12-25',
        location: 'Marseille, France',
        categoryId: 3
      },
      {
        id: 4,
        title: 'Formation React',
        description: 'Maîtrisez React avec hooks, context et les meilleures pratiques.',
        date: '2025-01-10',
        location: 'Toulouse, France',
        categoryId: 2
      }
    ];
  }

  onEventSelected(event: Event): void {
    console.log('Événement sélectionné:', event);
  }

  onEventDeleted(eventId: number): void {
    console.log('Événement supprimé:', eventId);
    this.featuredEvents = this.featuredEvents.filter(e => e.id !== eventId);
    this.upcomingEvents = this.upcomingEvents.filter(e => e.id !== eventId);
  }
}
