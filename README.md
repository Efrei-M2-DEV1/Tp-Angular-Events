# EVENTS MANAGER - Application de Gestion d'Événements

Fonctionnalités principales : authentification, rôles (admin / user), CRUD, inscription avec génération de billet PDF (QR code), filtrage multi-catégories, recherche temps réel, segmentation événements passés / à venir et mode sombre global.

**Contributeurs & rôles :**
- **Verdiane KOCOUVISSO PLOMEY** – Vues / UX / Théming (Dark Mode, composants UI, filtres, tickets)
- **Lorris LABARRE** – Backend JSON Server / Modélisation / Services métier
- **Mody DIAKHITE** – Authentification / Gestion des utilisateurs / Sécurité front (guards & interceptor)

## Démarrage

### Installation
```bash
npm install
```

Pour démarrer le serveur backend (json-server) :
```bash
npm run json-server
```
Le serveur sera accessible sur : `http://localhost:3000`

Pour démarrer le serveur frontend (Application Angular) :
```bash
npm start
```
Le serveur sera accessible sur : `http://localhost:4200`

## API Endpoints (JSON Server)

### Users
- `GET /users` - Récupérer tous les utilisateurs
- `GET /users/:id` - Récupérer un utilisateur par ID
- `GET /users?email=xxx` - Rechercher par email
- `POST /users` - Créer un utilisateur
- `PATCH /users/:id` - Modifier un utilisateur
- `DELETE /users/:id` - Supprimer un utilisateur

### Events
- `GET /events` - Récupérer tous les événements
- `GET /events/:id` - Récupérer un événement par ID
- `GET /events?userId=xxx` - Filtrer par utilisateur
- `GET /events?categoryId=xxx` - Filtrer par catégorie
- `GET /events?title_like=xxx` - Rechercher par titre
- `POST /events` - Créer un événement
- `PATCH /events/:id` - Modifier un événement
- `DELETE /events/:id` - Supprimer un événement

### Categories
- `GET /categories` - Récupérer toutes les catégories
- `GET /categories/:id` - Récupérer une catégorie par ID
- `POST /categories` - Créer une catégorie
- `PATCH /categories/:id` - Modifier une catégorie
- `DELETE /categories/:id` - Supprimer une catégorie

## Structure de la base de données

### Table `users`
```typescript
interface User {
  id: string; 
  firstName: string;
  lastName: string;
  email: string;
  password: string; 
  role: 'admin' | 'user';
  createdAt: string; 
}
```

### Table `categories`
```typescript
interface Category {
  id: string | number;
  name: string;
  color: string; 
}
```

### Table `events`
```typescript
interface Event {
  id: string | number;
  title: string;
  description: string;
  date: string; 
  location?: string;
  categoryId?: string | number;
  organizerId: string; 
  maxParticipants: number;
  currentParticipants: number;
  status?: "upcoming" | "past" | "cancelled";
  imageUrl?: string;
  createdAt: string; 
  updatedAt?: string; 
}
```


## Comptes de test & rôles

| Rôle | Email | Mot de passe | Capacités principales |
|------|-------|--------------|-----------------------|
| Admin | `admin@admin.com` | `adminadmin` | CRUD événements, suppression, modification, accès formulaire, voir compte participants y compris événements passés |
| User | `john@example.com` | `password123` | Consulter, rechercher, filtrer, s'inscrire, télécharger billet PDF, voir ses réservations |

Différences clés :
- L'**admin** peut créer, modifier, supprimer tout événement et voit les compteurs participants même pour les événements passés.
- Le **user** ne voit pas les boutons d'administration, ne peut pas accéder aux routes protégées de création / modification et ne voit pas certains compteurs pour les événements passés.

Mécanismes techniques :
- `RoleService` expose `isAdmin()`, `canCreateEvent()`, `canEditEvent()`, `canDeleteEvent()`.
- `AdminGuard` protège les routes sensibles (`/event-form` création / édition).
- Affichage conditionnel via `*ngIf` dans les templates (Home, Event Card, Event Detail).

Sécurité (dev vs prod) : en prod il faudra ajouter vérification côté backend + JWT avec claims de rôle et hash des mots de passe.

## Architecture Applicative

### Routes principales
| Route | Composant | Protection | Description |
|-------|-----------|-----------|-------------|
| `/` ou `/home` | `HomeComponent` | Public | Liste événements (passés / à venir), recherche, filtres multi-catégories |
| `/login` | `LoginComponent` | Public | Connexion utilisateur |
| `/register` | `RegisterComponent` | Public | Création de compte |
| `/event/:id` | `EventDetailComponent` | Public | Détails, inscription, téléchargement billet PDF |
| `/event-form` | `EventFormComponent` | AdminGuard | Création événement |
| `/event-form/:id` | `EventFormComponent` | AdminGuard | Édition événement |
| `/reservations` | `ReservationsComponent` | AuthGuard | Liste des événements où l'utilisateur est inscrit |
| `/profile` | `ProfileComponent` | AuthGuard | Edition profil utilisateur |

### Composants clés
- `HomeComponent` : segmentation upcoming/past, recherche temps réel, multi-filtre catégories (chips), dark mode friendly.
- `EventCardComponent` : aperçu + actions conditionnelles selon rôle, chip date, badge catégorie.
- `EventDetailComponent` : vue détaillée, inscription, ticket PDF, badge catégorie, règles événements passés.
- `EventFormComponent` : création / édition avec validateur personnalisé de date future.
- `ReservationsComponent` : événements enregistrés + génération de ticket.
- `ProfileComponent` : édition des infos utilisateur.
- `HeaderComponent` : menu, affichage utilisateur, toggle Dark Mode.
- `LoginComponent` / `RegisterComponent` : flux d'authentification basique.

### Services
- `AuthService` : login / register / logout / session (localStorage token simulé)
- `EventService` : CRUD événements + helpers tri upcoming/past
- `CategoryService` : CRUD catégories
- `RegistrationService` : inscription locale (persistée en `localStorage`), compte participants
- `TicketService` : génération PDF (jsPDF + QR code) avec branding "Events Manager"
- `ThemeService` : gestion light/dark via attribut `data-theme`
- `StorageService` : abstraction lecture/écriture localStorage
- `RoleService` : logique d'autorisation côté UI
- `AuthInterceptor` : (si activé) injection token / futures évolutions sécuritaires

### Guards & Interceptor
- `AuthGuard` : accès réservé aux pages nécessitant session (ex: réservations, profil)
- `AdminGuard` : restreint création / édition d'événements
- `AuthInterceptor` : point d'extension pour header Authorization

### Éléments personnalisés
- **Validateur** `futureDateValidator` : empêche sélection de dates passées pour un nouvel événement.
- **Pipe** `DateFormatPipe` : formats court/long/relatif des dates (y compris messages "Date invalide").
- **Directive** `HighlightDirective` : effet hover (accentuation bordure) sans casser le thème (corrige ancien bug de fond blanc persistant).

### Gestion des inscriptions
- Initialement JSON; pivot vers stockage `localStorage` pour simplifier développement.
- Structure de `registration`: `{ id, userId, eventId, registeredAt }`.
- Calcul dynamique du nombre de participants + mise à jour dans l'UI.

### Billet PDF avec QR Code
- Génération via `TicketService` utilisant `jsPDF` + `qrcode` (typings locaux).
- Contenu : titre, date formatée, lieu, catégorie, nom/prénom utilisateur, ID inscription, QR avec payload JSON.
- Bouton disponible sur la page détail après inscription et dans `ReservationsComponent`.

### Recherche & Filtrage
- Barre de recherche temps réel sur titre + description.
- Chips multi-sélection catégories (suppression via ✕ / réinitialisation "Toutes les catégories").
- Filtrage appliqué séparément sur listes passées / à venir.

### Dark Mode
- Variables CSS (couleurs, bordures, fonds) définies dans `styles.scss`.
- Toggle dans `HeaderComponent`, persistance via `localStorage`.
- Composants utilisent `var(--card-bg)`, `var(--text-color)`, etc. pour cohérence.

### Événements passés
- Boutons d'inscription / édition / suppression masqués pour un user standard si date < maintenant.
- Admin voit compte participants même pour événements passés; user voit liste mais actions limitées.

### HTTP & Données
- JSON Server fournit endpoints `users`, `events`, `categories`.
- Inscriptions et thème stockés en `localStorage` (aucun endpoint distant).
- IDs normalisés en string pour éviter collisions.

## Comment tester rapidement ?
1. Lancer le backend : `npm run json-server` (http://localhost:3000)
2. Lancer le frontend : `npm start` (http://localhost:4200)
3. Se connecter en **admin** : créer / éditer / supprimer un événement, vérifier affichage compteurs passés.
4. Se connecter en **user** : rechercher, filtrer, s'inscrire à un événement futur, télécharger le billet PDF dans Détails puis vérifier dans Réservations.
5. Basculer Dark Mode et vérifier adaptation UI sans fond blanc résiduel.

## Points d'amélioration futur
- Hash mots de passe & vraie gestion JWT + claims rôle
- Mise en place d'un dashboard
- Pagination / lazy loading événements
- Notifications par mail
- Synchronisation des inscriptions côté backend



