import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {

  transform(value: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string {
    if (!value) return '';
    
    const date = typeof value === 'string' ? new Date(value) : value;
    
    if (isNaN(date.getTime())) return 'Date invalide';
    
    switch (format) {
      case 'short':
        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      
      case 'long':
        return date.toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      
      case 'relative':
        return this.getRelativeTime(date);
      
      default:
        return date.toLocaleDateString('fr-FR');
    }
  }

  private getRelativeTime(date: Date): string {
    const now = new Date();
    const diffInMs = date.getTime() - now.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Aujourd'hui";
    if (diffInDays === 1) return "Demain";
    if (diffInDays === -1) return "Hier";
    if (diffInDays > 0) return `Dans ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    if (diffInDays < 0) return `Il y a ${Math.abs(diffInDays)} jour${Math.abs(diffInDays) > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('fr-FR');
  }
}
