import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RegistrationService } from '../core/services/registration.service';
import { TicketService } from '../core/services/ticket.service';
import { AuthService } from '../core/services/auth.service';
import { Event } from '../core/models/event.model';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservations.component.html',
  styleUrls: ['./reservations.component.scss']
})
export class ReservationsComponent implements OnInit {
  reservations: Event[] = [];
  isLoading = true;

  constructor(
    private registrationService: RegistrationService,
    private router: Router,
    private ticketService: TicketService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserReservations();
  }

  loadUserReservations(): void {
    this.registrationService.getUserRegisteredEvents().subscribe({
      next: (events) => {
        this.reservations = events;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des réservations:', error);
        this.isLoading = false;
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  viewEventDetail(eventId: string | number | undefined): void {
    if (eventId) {
      this.router.navigate(['/event', eventId]);
    }
  }

  cancelRegistration(eventId: string | number | undefined): void {
    if (!eventId) return;

    if (confirm('Voulez-vous vraiment annuler votre inscription à cet événement ?')) {
      this.registrationService.unregisterFromEvent(eventId).subscribe({
        next: () => {
          // Recharger la liste
          this.loadUserReservations();
        },
        error: (error) => {
          console.error('Erreur lors de l\'annulation:', error);
        }
      });
    }
  }

  downloadTicket(eventId: string | number | undefined): void {
    if (!eventId) return;
    // Récupérer l'inscription pour cet event
    this.registrationService.getUserRegistrations().subscribe({
      next: regs => {
        const reg = regs.find(r => String(r.eventId) === String(eventId));
        const ev = this.reservations.find(e => String(e.id) === String(eventId));
        const user = this.authService.getCurrentUser();
        if (reg && ev && user) {
          this.ticketService.generateTicket(ev, user as any, reg)
            .catch(err => console.error('Erreur génération billet:', err));
        }
      }
    });
  }
}
