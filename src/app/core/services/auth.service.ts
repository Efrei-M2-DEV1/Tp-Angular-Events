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
    // Récupérer l'utilisateur du localStorage au démarrage
    const storedUser = this.getUserFromStorage();
    if (storedUser) {
      this.currentUserSubject.next(storedUser);
    }
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  register(registerData: RegisterData): Observable<User> {
    const { name, email, password } = registerData;
    const newUser = {
      name,
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

        // Générer un token
        const token = this.generateToken(user);
        this.saveAuthData(user, token);
        this.currentUserSubject.next(user);
        
        return user;
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
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
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
    return this.currentUserSubject.value;
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
