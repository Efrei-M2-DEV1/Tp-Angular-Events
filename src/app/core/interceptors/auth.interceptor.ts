import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Récupérer le token
    const token = this.authService.getToken();

    // Cloner la requête et ajouter le token dans les headers
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    // Gérer les erreurs globales
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expiré ou invalide, déconnecter l'utilisateur
          console.error('Token invalide ou expiré');
          this.authService.logout();
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
  }
}
