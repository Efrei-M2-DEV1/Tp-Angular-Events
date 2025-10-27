import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Event, CreateEventDto } from '../core/models/event.model';
import { EventService } from '../core/services/event.service';
import { CategoryService } from '../core/services/category.service';
import { Category } from '../core/models/category.model';
import { futureDateValidator } from '../shared/validators/future-date.validator';
import { NotificationService } from '../shared/notifications/notification.service';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss']
})
export class EventFormComponent implements OnInit {
  @Input() event?: Event;

  eventForm!: FormGroup;
  isSubmitting = false;
  categories: Category[] = [];
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private notifications: NotificationService
  ) {}

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['event']) {
      this.event = navigation.extras.state['event'] as Event;
      this.isEditMode = true;
    }
    
    this.loadCategories();
    this.initializeForm();

   
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && !this.event) {
      
      const idForFetch: any = /^(\d+)$/.test(idParam) ? Number(idParam) : idParam;
      this.isEditMode = true;
      this.eventService.getEventById(idForFetch).subscribe({
          next: (evt) => {
            this.event = evt;
            this.eventForm.patchValue({
              title: evt.title,
              description: evt.description,
              date: this.formatDateForInput(evt.date),
              location: evt.location || '',
              categoryId: evt.categoryId || null,
              maxParticipants: evt.maxParticipants || 50
            });
          },
          error: (err) => {
            console.error('Impossible de charger l\'événement:', err);
          }
        });
    }
  }

  private loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des catégories:', error);
      }
    });
  }

  private initializeForm(): void {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
  description: ['', [Validators.required, Validators.minLength(10)]],
      date: ['', [Validators.required, futureDateValidator()]],
      location: ['', [Validators.maxLength(100)]],
      categoryId: [null],
      maxParticipants: [50, [Validators.required, Validators.min(1), Validators.max(10000)]]
    });

    if (this.event) {
      this.eventForm.patchValue({
        title: this.event.title,
        description: this.event.description,
        date: this.formatDateForInput(this.event.date),
        location: this.event.location || '',
        categoryId: this.event.categoryId || null,
        maxParticipants: this.event.maxParticipants || 50
      });
    }
  }

  private formatDateForInput(dateStr: string | Date): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
  }

  onSubmit(): void {
    if (this.eventForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formData: CreateEventDto = this.eventForm.value;
      
      if (!formData.location?.trim()) {
        delete formData.location;
      }
      if (!formData.categoryId) {
        delete formData.categoryId;
      }

      if (this.isEditMode && this.event?.id) {
        this.eventService.updateEvent(this.event.id, formData).subscribe({
          next: () => {
            this.notifications.success('Événement modifié avec succès !');
            this.router.navigate(['/home']);
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour:', error);
            this.notifications.error('Erreur lors de la modification de l\'événement');
            this.isSubmitting = false;
          }
        });
      } else {
        this.eventService.createEvent(formData, 1).subscribe({
          next: () => {
            this.notifications.success('Événement créé avec succès !');
            this.eventForm.reset();
            this.router.navigate(['/home']);
          },
          error: (error) => {
            console.error('Erreur lors de la création:', error);
            this.notifications.error('Erreur lors de la création de l\'événement');
            this.isSubmitting = false;
          }
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/home']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.eventForm.controls).forEach(key => {
      const control = this.eventForm.get(key);
      control?.markAsTouched();
    });
  }

  get title(): AbstractControl | null { return this.eventForm.get('title'); }
  get description(): AbstractControl | null { return this.eventForm.get('description'); }
  get date(): AbstractControl | null { return this.eventForm.get('date'); }
  get location(): AbstractControl | null { return this.eventForm.get('location'); }
  get categoryId(): AbstractControl | null { return this.eventForm.get('categoryId'); }
  get maxParticipants(): AbstractControl | null { return this.eventForm.get('maxParticipants'); }
  
  hasError(controlName: string, errorType: string): boolean {
    const control = this.eventForm.get(controlName);
    return !!(control && control.hasError(errorType) && control.touched);
  }

  getErrorMessage(controlName: string): string {
    const control = this.eventForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;
    if (errors['required']) return 'Ce champ est obligatoire';
    if (errors['minlength']) return `Minimum ${errors['minlength'].requiredLength} caractères`;
  // if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} caractères`;
    if (errors['min']) return `Le minimum est ${errors['min'].min}`;
    if (errors['max']) return `Le maximum est ${errors['max'].max}`;
    if (errors['futureDate']) return errors['futureDate'].message;
    
    return 'Champ invalide';
  }
}
