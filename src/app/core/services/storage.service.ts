import { Injectable } from '@angular/core';

export const LS_KEYS = {
  EVENTS: 'events',
  REGISTRATIONS: 'registrations',
  USERS: 'users',
  CURRENT_USER: 'currentUser'
};

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  /**
   * Lit une valeur du localStorage avec un fallback
   */
  read<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) as T : fallback;
    } catch (error) {
      console.error(`Erreur lecture localStorage [${key}]:`, error);
      return fallback;
    }
  }

  /**
   * Écrit une valeur dans le localStorage
   */
  write<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Erreur écriture localStorage [${key}]:`, error);
    }
  }

  /**
   * Supprime une clé du localStorage
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Erreur suppression localStorage [${key}]:`, error);
    }
  }

  /**
   * Vide complètement le localStorage
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Erreur vidage localStorage:', error);
    }
  }
}
