export interface Event {
  id?: number;
  title: string;
  description: string;
  date: string;
  location?: string;
  categoryId?: number;
  userId?: number;
  maxParticipants?: number;
  currentParticipants?: number;
  createdAt?: string;
}

export interface CreateEventDto {
  title: string;
  description: string;
  date: string;
  location?: string;
  categoryId?: number;
  maxParticipants?: number;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  date?: string;
  location?: string;
  categoryId?: number;
  maxParticipants?: number;
  currentParticipants?: number;
}
