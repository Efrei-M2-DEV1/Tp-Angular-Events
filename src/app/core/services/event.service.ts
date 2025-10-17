import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Event, CreateEventDto, UpdateEventDto } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = 'http://localhost:3000/events';

  constructor(private http: HttpClient) {}

  /**
   * Récupérer tous les événements
   */
  getAllEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Récupérer un événement par ID
   */
  getEventById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Récupérer les événements d'un utilisateur
   */
  getEventsByUserId(userId: number): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}?userId=${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Récupérer les événements d'une catégorie
   */
  getEventsByCategoryId(categoryId: number): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}?categoryId=${categoryId}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Créer un nouvel événement
   */
  createEvent(eventData: CreateEventDto, userId: number): Observable<Event> {
    const newEvent = {
      ...eventData,
      userId,
      currentParticipants: 0,
      createdAt: new Date().toISOString()
    };

    return this.http.post<Event>(this.apiUrl, newEvent).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Mettre à jour un événement existant
   */
  updateEvent(id: number, eventData: UpdateEventDto): Observable<Event> {
    return this.http.patch<Event>(`${this.apiUrl}/${id}`, eventData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Supprimer un événement
   */
  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Rechercher des événements par titre
   */
  searchEventsByTitle(searchTerm: string): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}?title_like=${searchTerm}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Récupérer les événements à venir (date >= aujourd'hui)
   */
  getUpcomingEvents(): Observable<Event[]> {
    return this.getAllEvents().pipe(
      map(events => {
        const now = new Date().getTime();
        return events.filter(event => new Date(event.date).getTime() >= now);
      })
    );
  }

  /**
   * Récupérer les événements passés (date < aujourd'hui)
   */
  getPastEvents(): Observable<Event[]> {
    return this.getAllEvents().pipe(
      map(events => {
        const now = new Date().getTime();
        return events.filter(event => new Date(event.date).getTime() < now);
      })
    );
  }

  /**
   * Inscrire un participant à un événement
   */
  registerParticipant(eventId: number): Observable<Event> {
    return this.getEventById(eventId).pipe(
      map(event => {
        if (event.maxParticipants && event.currentParticipants && 
            event.currentParticipants >= event.maxParticipants) {
          throw new Error('Événement complet');
        }
        
        const updatedEvent = {
          currentParticipants: (event.currentParticipants || 0) + 1
        };
        
        return this.updateEvent(eventId, updatedEvent);
      }),
      catchError(this.handleError)
    ) as any;
  }

  /**
   * Gérer les erreurs HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      errorMessage = `Code d'erreur: ${error.status}\nMessage: ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
