import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of, switchMap, map } from 'rxjs';
import { Registration } from '../models/registration.model';
import { Event } from '../models/event.model';
import { AuthService } from './auth.service';
import { EventService } from './event.service';
import { StorageService, LS_KEYS } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private apiUrl = 'http://localhost:3000/registrations';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private eventService: EventService,
    private storage: StorageService
  ) {
    // Initialiser le tableau des inscriptions si inexistant
    this.initializeRegistrations();
  }

  /**
   * Initialise le localStorage pour les inscriptions si nécessaire
   */
  private initializeRegistrations(): void {
    const existing = localStorage.getItem(LS_KEYS.REGISTRATIONS);
    if (!existing) {
      console.log('RegistrationService - Initializing registrations in localStorage');
      this.storage.write(LS_KEYS.REGISTRATIONS, []);
    } else {
      const registrations = this.storage.read<Registration[]>(LS_KEYS.REGISTRATIONS, []);
      console.log('RegistrationService - Found existing registrations:', registrations.length);
    }
  }

  /**
   * Inscrit un utilisateur à un événement (localStorage)
   */
  registerToEvent(eventId: string | number): Observable<Registration> {
    const user = this.authService.getCurrentUser();
    console.log('RegistrationService.registerToEvent - Current user:', user);
    
    if (!user?.id) {
      console.error('RegistrationService.registerToEvent - No user found!');
      throw new Error('Utilisateur non connecté');
    }

    // Normaliser les IDs en chaînes pour éviter les problèmes de comparaison
    const userId = String(user.id);
    const normalizedEventId = String(eventId);

    // Lire les inscriptions existantes
    const registrations = this.storage.read<Registration[]>(LS_KEYS.REGISTRATIONS, []);
    
    // Vérifier si déjà inscrit
    const alreadyRegistered = registrations.some(
      reg => String(reg.userId) === userId && String(reg.eventId) === normalizedEventId
    );

    if (alreadyRegistered) {
      console.warn('RegistrationService.registerToEvent - Already registered!');
      throw new Error('Vous êtes déjà inscrit à cet événement');
    }

    // Créer la nouvelle inscription
    const registration: Registration = {
      id: Date.now().toString(), // Génère un ID unique basé sur timestamp
      userId: userId,
      eventId: normalizedEventId,
      registeredAt: new Date().toISOString()
    };

    console.log('RegistrationService.registerToEvent - Creating registration:', registration);

    // Ajouter et sauvegarder
    registrations.push(registration);
    this.storage.write(LS_KEYS.REGISTRATIONS, registrations);

    console.log('RegistrationService.registerToEvent - Success! Total registrations:', registrations.length);

    return of(registration);
  }

  /**
   * Désinscrit un utilisateur d'un événement (localStorage)
   */
  unregisterFromEvent(eventId: string | number): Observable<void> {
    const user = this.authService.getCurrentUser();
    if (!user?.id) {
      throw new Error('Utilisateur non connecté');
    }

    const userId = String(user.id);
    const normalizedEventId = String(eventId);

    // Lire et filtrer les inscriptions
    const registrations = this.storage.read<Registration[]>(LS_KEYS.REGISTRATIONS, []);
    const updatedRegistrations = registrations.filter(
      reg => !(String(reg.userId) === userId && String(reg.eventId) === normalizedEventId)
    );

    // Sauvegarder
    this.storage.write(LS_KEYS.REGISTRATIONS, updatedRegistrations);
    
    console.log('RegistrationService.unregisterFromEvent - Removed registration');
    return of(undefined);
  }

  /**
   * Vérifie si l'utilisateur est inscrit à un événement (localStorage)
   */
  isUserRegistered(eventId: string | number): Observable<boolean> {
    const user = this.authService.getCurrentUser();
    if (!user?.id) {
      return of(false);
    }

    const userId = String(user.id);
    const normalizedEventId = String(eventId);

    const registrations = this.storage.read<Registration[]>(LS_KEYS.REGISTRATIONS, []);
    const isRegistered = registrations.some(
      reg => String(reg.userId) === userId && String(reg.eventId) === normalizedEventId
    );

    return of(isRegistered);
  }

  /**
   * Récupère toutes les inscriptions d'un utilisateur (localStorage)
   */
  getUserRegistrations(): Observable<Registration[]> {
    const user = this.authService.getCurrentUser();
    if (!user?.id) {
      return of([]);
    }

    const userId = String(user.id);
    const registrations = this.storage.read<Registration[]>(LS_KEYS.REGISTRATIONS, []);
    const userRegistrations = registrations.filter(reg => String(reg.userId) === userId);

    console.log('RegistrationService.getUserRegistrations - Found:', userRegistrations.length);
    return of(userRegistrations);
  }

  /**
   * Récupère les événements auxquels l'utilisateur est inscrit
   */
  getUserRegisteredEvents(): Observable<Event[]> {
    return this.getUserRegistrations().pipe(
      switchMap(registrations => {
        if (registrations.length === 0) {
          return of([]);
        }

        // Récupérer tous les événements correspondants
        const eventRequests = registrations.map(reg =>
          this.eventService.getEventById(reg.eventId)
        );

        return forkJoin(eventRequests);
      })
    );
  }

  /**
   * Récupère le nombre d'inscriptions pour un événement (localStorage)
   */
  getEventRegistrationsCount(eventId: string | number): Observable<number> {
    const normalizedEventId = String(eventId);
    const registrations = this.storage.read<Registration[]>(LS_KEYS.REGISTRATIONS, []);
    const count = registrations.filter(reg => String(reg.eventId) === normalizedEventId).length;
    
    return of(count);
  }
}
