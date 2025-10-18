import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map } from 'rxjs';
import { User, LoginCredentials, RegisterData } from '../core/models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Vérifier si un utilisateur est déjà connecté
    const savedUser = this.getUserFromStorage();
    if (savedUser) {
      this.currentUserSubject.next(savedUser);
    }
  }

  /**
   * Connexion d'un utilisateur
   */
  login(credentials: LoginCredentials): Observable<User> {
    return this.http.get<User[]>(`${this.apiUrl}/users?email=${credentials.email}&password=${credentials.password}`)
      .pipe(
        map((users: User[]) => {
          if (users.length > 0) {
            const user = users[0];
            // Générer un token JWT simulé
            const token = this.generateToken(user);
            
            // Sauvegarder dans localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Mettre à jour le sujet
            this.currentUserSubject.next(user);
            
            return user;
          } else {
            throw new Error('Email ou mot de passe incorrect');
          }
        })
      );
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  register(userData: RegisterData): Observable<User> {
    const newUser: User = {
      ...userData,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    return this.http.post<User>(`${this.apiUrl}/users`, newUser)
      .pipe(
        tap((user: User) => {
          // Génération d'un token
          const token = this.generateToken(user);
          
          // Sauvegarder dans localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('currentUser', JSON.stringify(user));
          
          // Mettre à jour le sujet
          this.currentUserSubject.next(user);
        })
      );
  }

  /**
   * Déconnexion
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Récupérer le token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Récupérer l'utilisateur courant
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Générer un token JWT simulé (Base64)
   */
  private generateToken(user: User): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ 
      id: user.id, 
      email: user.email, 
      role: user.role,
      exp: Date.now() + 3600000 // 1 heure
    }));
    const signature = btoa('secret-key');
    return `${header}.${payload}.${signature}`;
  }

  /**
   * Récupérer l'utilisateur depuis le localStorage
   */
  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  }
}