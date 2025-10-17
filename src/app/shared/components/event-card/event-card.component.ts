import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Event } from '../../../core/models/event.model';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss']
})
export class EventCardComponent {
  @Input() event!: Event;
  @Input() showActions: boolean = true;
  @Input() categories: Category[] = [];
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

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Non catégorisé';
  }

  getCategoryColor(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.color : '#666';
  }
}
