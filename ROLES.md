# Gestion des Rôles - Events Manager

## Vue d'ensemble

Le système de gestion des rôles permet de restreindre certaines fonctionnalités aux administrateurs uniquement.

## Rôles disponibles

### 1. **Admin** (`role: "admin"`)
- Peut créer des événements
- Peut modifier tous les événements
- Peut supprimer tous les événements
- Voit tous les boutons de gestion

### 2. **User** (`role: "user"` ou absence de rôle admin)
- Peut consulter les événements
- Peut s'inscrire aux événements
- **NE PEUT PAS** créer d'événements
- **NE VOIT PAS** les boutons Modifier/Supprimer

## Comptes de test

### Admin
- **Email**: admin@admin.com
- **Password**: adminadmin
- **Permissions**: Toutes

### User standard
- **Email**: john@example.com
- **Password**: password123
- **Permissions**: Lecture et inscription uniquement

## Implémentation technique

### 1. Service RoleService (`role.service.ts`)
```typescript
isAdmin(): boolean              // Vérifie si l'utilisateur est admin
canCreateEvent(): boolean       // Peut créer un événement
canEditEvent(): boolean         // Peut modifier un événement
canDeleteEvent(): boolean       // Peut supprimer un événement
```

### 2. Guard AdminGuard (`admin.guard.ts`)
Protège les routes de création et modification d'événements :
- `/event-form` (création)
- `/event-form/:id` (modification)

Si un utilisateur non-admin tente d'accéder à ces routes, il est redirigé vers `/home`.

### 3. Affichage conditionnel dans les templates

#### Home (`home.component.html`)
```html
<button *ngIf="roleService.canCreateEvent()">Créer un événement</button>
```

#### Event Detail (`event-detail.component.html`)
```html
<button *ngIf="roleService.canEditEvent()">Modifier</button>
<button *ngIf="roleService.canDeleteEvent()">Supprimer</button>
```

#### Event Card (`event-card.component.html`)
```html
<button *ngIf="roleService.canEditEvent()">✏️ Modifier</button>
<button *ngIf="roleService.canDeleteEvent()">🗑️ Supprimer</button>
```

## Comment tester

### Test Admin
1. Connectez-vous avec `admin@admin.com` / `adminadmin`
2. ✅ Vous devez voir le bouton "Créer un événement" sur la home
3. ✅ Vous devez voir les boutons "Modifier" et "Supprimer" sur les cartes d'événements
4. ✅ Vous pouvez accéder à `/event-form` pour créer un événement
5. ✅ Vous pouvez modifier et supprimer n'importe quel événement

### Test User
1. Connectez-vous avec `john@example.com` / `password123`
2. ❌ Vous NE devez PAS voir le bouton "Créer un événement"
3. ❌ Vous NE devez PAS voir les boutons "Modifier" et "Supprimer"
4. ✅ Vous pouvez consulter les événements
5. ✅ Vous pouvez vous inscrire aux événements
6. ❌ Si vous tentez d'accéder manuellement à `/event-form`, vous êtes redirigé vers `/home`

## Sécurité

### Protection côté frontend
- Masquage des boutons via `*ngIf`
- Protection des routes via `AdminGuard`
- Vérifications dans `RoleService`

### ⚠️ Important
La sécurité frontend peut être contournée. Dans une application de production, il faut :
1. **Valider le rôle côté backend** pour toutes les opérations sensibles
2. Ajouter des vérifications d'autorisation dans les endpoints API
3. Utiliser des JWT avec claims de rôle
4. Implémenter une vraie gestion des permissions côté serveur

## Extension future

Pour étendre le système de rôles :

1. **Ajout de nouveaux rôles** (ex: `moderator`, `organizer`)
2. **Permissions granulaires** (ex: peut modifier ses propres événements)
3. **Gestion des propriétaires d'événements** (userId sur Event)
4. **Système de permissions basé sur les ressources**

Exemple pour un utilisateur qui peut modifier ses propres événements :
```typescript
canEditEvent(eventOwnerId?: string): boolean {
  const user = this.authService.getCurrentUser();
  if (!user) return false;
  
  if (this.isAdmin()) return true;
  
  // User peut modifier ses propres événements
  return user.id === eventOwnerId;
}
```
