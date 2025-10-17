import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function futureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return { futureDate: { 
        message: 'La date doit être dans le futur',
        actualDate: selectedDate.toLocaleDateString('fr-FR')
      } };
    }

    return null;
  };
}

export function uniqueEmailValidator(existingEmails: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const email = control.value.toLowerCase();
    if (existingEmails.includes(email)) {
      return { uniqueEmail: { 
        message: 'Cette adresse email est déjà utilisée',
        email: email
      } };
    }

    return null;
  };
}
