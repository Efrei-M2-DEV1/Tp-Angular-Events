import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { EventFormComponent } from './event-form/event-form.component';
import { EventDetailComponent } from './event-detail/event-detail.component';
import { ProfileComponent } from './profile/profile.component';
import { ReservationsComponent } from './reservations/reservations.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Route par défaut - Redirection vers login
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },

  // Routes publiques (non protégées)
  {
    path: 'login',
    component: LoginComponent,
    title: 'Connexion'
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Inscription'
  },

  // Routes protégées (nécessitent une authentification)
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [authGuard],
    title: 'Accueil'
  },
  {
    path: 'event-form',
    component: EventFormComponent,
    canActivate: [authGuard],
    title: 'Créer un événement'
  },
  {
    path: 'event-form/:id',
    component: EventFormComponent,
    canActivate: [authGuard],
    title: 'Modifier un événement'
  },
  {
    path: 'event/:id',
    component: EventDetailComponent,
    canActivate: [authGuard],
    title: 'Détail de l\'événement'
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard],
    title: 'Mon profil'
  },
  {
    path: 'reservations',
    component: ReservationsComponent,
    canActivate: [authGuard],
    title: 'Mes réservations'
  },

  // Route wildcard - Page 404 (optionnelle mais recommandée)
  {
    path: '**',
    redirectTo: '/login'
  }
];