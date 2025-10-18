import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Cloner la requête et ajouter le token dans les headers
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Gérer les erreurs globales
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expiré ou invalide, déconnecter l'utilisateur
        console.error('Token invalide ou expiré');
        authService.logout();
      }

      if (error.status === 403) {
        console.error('Accès interdit');
      }

      if (error.status === 500) {
        console.error('Erreur serveur');
      }

      return throwError(() => error);
    })
  );
};

