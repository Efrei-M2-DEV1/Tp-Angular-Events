import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Event } from '../../../core/models/event.model';

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss']
})
export class EventCardComponent {
  @Input() event!: Event;
  @Input() showActions: boolean = true;
  @Output() eventSelected = new EventEmitter<Event>();
  @Output() eventDeleted = new EventEmitter<number>();

  onEventClick(): void {
    this.eventSelected.emit(this.event);
  }

  onDeleteClick(event: MouseEvent): void {
    event.stopPropagation();
    if (this.event.id) {
      this.eventDeleted.emit(this.event.id);
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
}
