# Backend - json-server

## 🚀 Démarrage du serveur

Pour démarrer le serveur backend (json-server) :

```bash
npm run json-server
```

Le serveur sera accessible sur : `http://localhost:3000`

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
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "createdAt": "2025-01-01T10:00:00.000Z"
}
```

### Table `categories`
```json
{
  "id": 1,
  "name": "Conférence",
  "color": "#3B82F6"
}
```

### Table `events`
```json
{
  "id": 1,
  "title": "Angular Workshop 2025",
  "description": "Un atelier complet sur Angular 16",
  "date": "2025-11-15T14:00:00.000Z",
  "location": "Paris, France",
  "categoryId": 2,
  "userId": 1,
  "maxParticipants": 30,
  "currentParticipants": 12,
  "createdAt": "2025-10-01T10:00:00.000Z"
}
```

## 🔧 Configuration

Le fichier `db.json` contient les données de test initiales.
Le serveur utilise le port `3000` par défaut.

## 📦 Services créés

- **AuthService** : Gestion de l'authentification (login, register, logout)
- **EventService** : CRUD complet pour les événements
- **CategoryService** : CRUD complet pour les catégories
- **AuthInterceptor** : Intercepteur HTTP pour gérer les tokens JWT
- **AuthGuard** : Guard pour protéger les routes nécessitant une authentification
