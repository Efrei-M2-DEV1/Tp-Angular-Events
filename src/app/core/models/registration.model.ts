export interface Registration {
  id?: string | number;
  userId: string | number;
  eventId: string | number;
  registeredAt: string;
  // Optional stable ticket identifier (defaults to id if present)
  ticketId?: string;
}
