import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Event, CreateEventDto } from '../core/models/event.model';
import { EventService } from '../core/services/event.service';
import { CategoryService } from '../core/services/category.service';
import { Category } from '../core/models/category.model';
import { futureDateValidator } from '../shared/validators/future-date.validator';

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
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.event;
    this.loadCategories();
    this.initializeForm();
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
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      date: ['', [Validators.required, futureDateValidator()]],
      location: ['', [Validators.maxLength(100)]],
      categoryId: [null]
    });

    if (this.event) {
      this.eventForm.patchValue({
        title: this.event.title,
        description: this.event.description,
        date: this.event.date,
        location: this.event.location || '',
        categoryId: this.event.categoryId || null
      });
    }
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
            console.log('Événement mis à jour avec succès');
            this.router.navigate(['/home']);
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour:', error);
            this.isSubmitting = false;
          }
        });
      } else {
        this.eventService.createEvent(formData, 1).subscribe({
          next: () => {
            console.log('Événement créé avec succès');
            this.eventForm.reset();
            this.router.navigate(['/home']);
          },
          error: (error) => {
            console.error('Erreur lors de la création:', error);
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
    if (errors['maxlength']) return `Maximum ${errors['maxlength'].requiredLength} caractères`;
    if (errors['futureDate']) return errors['futureDate'].message;
    
    return 'Champ invalide';
  }
}
