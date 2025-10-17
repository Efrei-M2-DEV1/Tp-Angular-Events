export interface Event {
  id?: number;
  title: string;
  description: string;
  date: string;                   // Format ISO : "2025-11-15"
  location?: string;
  userId?: number;                // ID de l'utilisateur qui a créé l'événement
  categoryId?: number;            // ID de la catégorie
}

export interface CreateEventDto {
  title: string;
  description: string;
  date: string;
  location?: string;
  categoryId?: number;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  date?: string;
  location?: string;
  categoryId?: number;
}
