import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  constructor(private authService: AuthService) {}

  /**
   * Vérifie si l'utilisateur connecté est un administrateur
   */
  isAdmin(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'admin';
  }

  /**
   * Vérifie si l'utilisateur peut créer un événement
   */
  canCreateEvent(): boolean {
    return this.isAdmin();
  }

  /**
   * Vérifie si l'utilisateur peut modifier un événement
   */
  canEditEvent(eventOwnerId?: string): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;
    
    // Un admin peut tout modifier
    if (this.isAdmin()) return true;
    
    // Un user peut modifier ses propres événements (si implémenté)
    if (eventOwnerId) {
      return user.id === eventOwnerId;
    }
    
    return false;
  }

  /**
   * Vérifie si l'utilisateur peut supprimer un événement
   */
  canDeleteEvent(eventOwnerId?: string): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) return false;
    
    // Un admin peut tout supprimer
    if (this.isAdmin()) return true;
    
    // Un user peut supprimer ses propres événements (si implémenté)
    if (eventOwnerId) {
      return user.id === eventOwnerId;
    }
    
    return false;
  }

  /**
   * Vérifie si l'utilisateur est un simple utilisateur (non-admin)
   */
  isUser(): boolean {
    const user = this.authService.getCurrentUser();
    return user !== null && user.role !== 'admin';
  }
}
