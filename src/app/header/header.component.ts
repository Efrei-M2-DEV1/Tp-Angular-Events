import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { Subscription } from 'rxjs';
import { User } from '../core/models/user.model';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  menuOpen = false;
  currentUser: User | null = null;
  private authSubscription?: Subscription;
  private routerSubscription?: Subscription;

  constructor(
    public auth: AuthService, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // Initialiser avec l'utilisateur actuel de manière synchrone
    this.currentUser = this.auth.getCurrentUser();
    console.log('Header Constructor - currentUser:', this.currentUser);
    console.log('Header Constructor - localStorage has:', localStorage.getItem('currentUser'));
  }

  ngOnInit(): void {
    // Forcer le rechargement initial
    this.loadCurrentUser();

    // S'abonner aux changements d'état de connexion
    this.authSubscription = this.auth.currentUser$.subscribe(user => {
      console.log('Header: currentUser$ subscription fired, user:', user);
      
      // Ne pas écraser avec null si on a déjà un utilisateur chargé depuis localStorage
      if (user !== null || this.currentUser === null) {
        this.currentUser = user;
        console.log('Header: currentUser updated to:', this.currentUser);
      } else {
        console.log('Header: Ignoring null emission, keeping current user from localStorage');
      }
      
      console.log('Header: isLoggedIn is now:', this.isLoggedIn);
      console.log('Header: displayName is now:', this.displayName);
      // Forcer la détection des changements
      this.cdr.detectChanges();
    });

    // Recharger l'utilisateur à chaque navigation
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        console.log('Navigation detected, reloading user from localStorage');
        this.loadCurrentUser();
      });

    // Écouter les événements de storage (au cas où)
    window.addEventListener('storage', () => {
      console.log('Storage event detected, reloading user');
      this.loadCurrentUser();
    });
  }

  private loadCurrentUser(): void {
    const storedUser = localStorage.getItem('currentUser');
    console.log('loadCurrentUser - localStorage contains:', storedUser);
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser);
        console.log('loadCurrentUser - Parsed user:', this.currentUser);
        this.cdr.detectChanges();
      } catch (e) {
        console.error('loadCurrentUser - Failed to parse user:', e);
      }
    } else {
      this.currentUser = null;
      console.log('loadCurrentUser - No user in localStorage');
    }
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    this.routerSubscription?.unsubscribe();
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  get displayName(): string {
    if (!this.currentUser) return '';
    const user: any = this.currentUser;
    // Retourner prénom + nom, ou juste prénom, ou email
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
    return fullName || user.email || 'Utilisateur';
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  navigateTo(route: string): void {
    this.menuOpen = false;
    this.router.navigate([route]);
  }

  onLogout(): void {
    this.menuOpen = false;
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
