import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Event, CreateEventDto } from '../core/models/event.model';
import { futureDateValidator } from '../shared/validators/future-date.validator';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss']
})
export class EventFormComponent implements OnInit {
  @Input() event?: Event;
  @Input() categories: any[] = [];
  @Output() eventSubmit = new EventEmitter<CreateEventDto>();
  @Output() formCancel = new EventEmitter<void>();

  eventForm!: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
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

      this.eventSubmit.emit(formData);
      
      setTimeout(() => {
        this.isSubmitting = false;
        if (!this.event) {
          this.eventForm.reset();
        }
      }, 1000);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.formCancel.emit();
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
