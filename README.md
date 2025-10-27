# Angular Events - Application de Gestion d'Événements

**Auteurs :** Loris, Verdiane et Mody

Une application web développée avec Angular pour la gestion d'événements avec système d'authentification.

## 🚀 Démarrage

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

## 📊 API Endpoints

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

## 📝 Structure de la base de données

### Table `users`
```typescript
interface User {
  id: string | number;
  name: string;
  email: string;
  password: string;
  role?: "admin" | "user";
  createdAt: string; // ISO 8601 date
}
```

### Table `categories`
```typescript
interface Category {
  id: string | number;
  name: string;
  color: string; // Hex color code
}
```

### Table `events`
```typescript
interface Event {
  id: string | number;
  title: string;
  description: string;
  date: string; // ISO 8601 date
  location?: string;
  categoryId?: string | number;
  userId: string | number;
  maxParticipants: number;
  currentParticipants: number;
  status?: "upcoming" | "past" | "cancelled";
  imageUrl?: string;
  createdAt: string; // ISO 8601 date
  updatedAt?: string; // ISO 8601 date
}
```


## 👤 Données & comptes de Test

Le fichier `db.json` contient les données de test initiales. Les mots de passes sont affichés en clair uniquement pour la démonstration. 

⚠️ En production, les mots de passe doivent être hashés.

## 📦 Services créés

- **AuthService** : Gestion de l'authentification (login, register, logout)
- **EventService** : CRUD complet pour les événements
- **CategoryService** : CRUD complet pour les catégories
- **AuthInterceptor** : Intercepteur HTTP pour gérer les tokens JWT
- **AuthGuard** : Guard pour protéger les routes nécessitant une authentification
