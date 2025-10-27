export interface Event {
  id: string | number;
  title: string;
  description: string;
  date: string;
  location?: string;
  categoryId?: string | number;
  userId?: string | number;
  organizerId?: string | number;
  maxParticipants?: number;
  currentParticipants?: number;
  status?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// export interface Event {
//   id?: number;
//   title: string;
//   description: string;
//   date: string;                   // Format ISO : "2025-11-15"
//   location?: string;
//   userId?: number;                // ID de l'utilisateur qui a créé l'événement
//   categoryId?: number;            // ID de la catégorie
// }

export interface CreateEventDto {
  title: string;
  description: string;
  date: string;
  location?: string;
  categoryId?: string | number;
  maxParticipants?: number;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  date?: string;
  location?: string;
  categoryId?: string | number;
  currentParticipants?: number;
  maxParticipants?: number;
}
