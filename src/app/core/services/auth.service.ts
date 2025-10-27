import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError, map } from 'rxjs';
import { User, LoginCredentials, RegisterData, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    console.log('AuthService Constructor - Loading user from storage');
    // Récupérer l'utilisateur du localStorage au démarrage
    const storedUser = this.getUserFromStorage();
    console.log('AuthService Constructor - Stored user:', storedUser);
    if (storedUser) {
      // Migrer les anciennes données si nécessaire
      const migratedUser = this.migrateUserData(storedUser);
      console.log('AuthService Constructor - Migrated user:', migratedUser);
      this.currentUserSubject.next(migratedUser);
      console.log('AuthService Constructor - User emitted to BehaviorSubject');
      
      // Sauvegarder les données migrées
      if (migratedUser !== storedUser) {
        localStorage.setItem('currentUser', JSON.stringify(migratedUser));
      }
    } else {
      console.log('AuthService Constructor - No user in storage, emitting null');
      this.currentUserSubject.next(null);
    }
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  register(registerData: RegisterData): Observable<User> {
    const { firstName, lastName, email, password } = registerData;
    const newUser = {
      firstName,
      lastName,
      email,
      password,
      createdAt: new Date().toISOString()
    };

    return this.http.post<User>(`${this.apiUrl}/users`, newUser).pipe(
      tap(user => {
        // Générer un token simple (en production, le backend le fait)
        const token = this.generateToken(user);
        this.saveAuthData(user, token);
        this.currentUserSubject.next(user);
      }),
      catchError(error => {
        console.error('Erreur lors de l\'inscription:', error);
        return throwError(() => new Error('Inscription échouée'));
      })
    );
  }

  /**
   * Connexion d'un utilisateur
   */
  login(credentials: LoginCredentials): Observable<User> {
    return this.http.get<User[]>(`${this.apiUrl}/users?email=${credentials.email}`).pipe(
      map(users => {
        if (users.length === 0) {
          throw new Error('Email non trouvé');
        }

        const user = users[0];
        if (user.password !== credentials.password) {
          throw new Error('Mot de passe incorrect');
        }

        // Migrer les anciennes données si nécessaire
        const migratedUser = this.migrateUserData(user);

        // Générer un token
        const token = this.generateToken(migratedUser);
        this.saveAuthData(migratedUser, token);
        
        console.log('Login: emitting user to BehaviorSubject:', migratedUser);
        this.currentUserSubject.next(migratedUser);
        
        return migratedUser;
      }),
      catchError(error => {
        console.error('Erreur lors de la connexion:', error);
        return throwError(() => new Error(error.message || 'Connexion échouée'));
      })
    );
  }

  /**
   * Déconnexion de l'utilisateur
   */
  logout(): void {
    console.log('AuthService.logout() called');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    console.log('AuthService.logout() - localStorage cleared, null emitted');
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Récupérer l'utilisateur actuel
   */
  getCurrentUser(): User | null {
    // Toujours charger depuis localStorage pour garantir la fraîcheur
    const storedUser = this.getUserFromStorage();
    const migratedUser = storedUser ? this.migrateUserData(storedUser) : null;
    console.log('AuthService.getCurrentUser() called - returning:', migratedUser);
    return migratedUser;
  }

  /**
   * Mettre à jour l'utilisateur courant (utile après modification du profil)
   */
  updateCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Récupérer le token JWT
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Sauvegarder les données d'authentification
   */
  private saveAuthData(user: User, token: string): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('token', token);
  }

  /**
   * Récupérer l'utilisateur du localStorage
   */
  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Migrer les anciennes données utilisateur (name -> firstName/lastName)
   */
  private migrateUserData(user: any): User {
    // Si l'utilisateur a déjà firstName/lastName, pas besoin de migration
    if (user.firstName && user.lastName) {
      return user;
    }

    // Si l'utilisateur a un champ "name" (ancien format)
    if (user.name && !user.firstName) {
      const nameParts = user.name.trim().split(' ');
      return {
        ...user,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        // Garder le champ name pour compatibilité
        name: user.name
      };
    }

    // Sinon, retourner l'utilisateur tel quel
    return user;
  }

  /**
   * Générer un token JWT simple (en production, c'est le backend qui le fait)
   */
  private generateToken(user: User): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ 
      sub: user.id, 
      email: user.email, 
      exp: Date.now() + 24 * 60 * 60 * 1000 // 24h
    }));
    const signature = btoa(`${header}.${payload}.secret`);
    return `${header}.${payload}.${signature}`;
  }
}
