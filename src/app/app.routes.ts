import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
// import { HomeComponent } from './components/home/home.component';
// import { EventsComponent } from './components/events/events.component';
// import { EventDetailComponent } from './components/event-detail/event-detail.component';
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
  // {
  //   path: 'home',
  //   component: HomeComponent,
  //   canActivate: [authGuard],
  //   title: 'Accueil'
  // },
  // {
  //   path: 'events',
  //   component: EventsComponent,
  //   canActivate: [authGuard],
  //   title: 'Événements'
  // },
  // {
  //   path: 'event/:id',
  //   component: EventDetailComponent,
  //   canActivate: [authGuard],
  //   title: 'Détail de l\'événement'
  // },

  // Route wildcard - Page 404 (optionnelle mais recommandée)
  {
    path: '**',
    redirectTo: '/login'
  }
];