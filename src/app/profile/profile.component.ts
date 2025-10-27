import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../core/services/auth.service';
import { User } from '../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  editMode = false;
  profileForm: FormGroup;

  constructor(
    private auth: AuthService,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.user = this.auth.getCurrentUser();
    if (this.user) {
      // Gérer la migration des données si nécessaire
      const firstName = this.user.firstName || (this.user.name ? this.user.name.split(' ')[0] : '');
      const lastName = this.user.lastName || (this.user.name ? this.user.name.split(' ').slice(1).join(' ') : '');
      
      this.profileForm.patchValue({
        firstName: firstName,
        lastName: lastName,
        email: this.user.email
      });
    }
  }

  enableEdit(): void {
    this.editMode = true;
    // Recharger les valeurs actuelles dans le formulaire
    if (this.user) {
      console.log('User data to edit:', this.user);
      
      // Gérer la migration des données si nécessaire
      const firstName = this.user.firstName || (this.user.name ? this.user.name.split(' ')[0] : '');
      const lastName = this.user.lastName || (this.user.name ? this.user.name.split(' ').slice(1).join(' ') : '');
      
      this.profileForm.patchValue({
        firstName: firstName,
        lastName: lastName,
        email: this.user.email
      });
      console.log('Form values after patch:', this.profileForm.value);
    }
  }

  cancelEdit(): void {
    this.editMode = false;
    // Restaurer les valeurs originales
    if (this.user) {
      const firstName = this.user.firstName || (this.user.name ? this.user.name.split(' ')[0] : '');
      const lastName = this.user.lastName || (this.user.name ? this.user.name.split(' ').slice(1).join(' ') : '');
      
      this.profileForm.patchValue({
        firstName: firstName,
        lastName: lastName,
        email: this.user.email
      });
    }
  }

  onSubmit(): void {
    if (this.profileForm.valid && this.user?.id) {
      const updatedUser = {
        ...this.user,
        firstName: this.profileForm.value.firstName,
        lastName: this.profileForm.value.lastName,
        email: this.profileForm.value.email
      };

      this.http.put<User>(`http://localhost:3000/users/${this.user.id}`, updatedUser)
        .subscribe({
          next: (user) => {
            this.user = user;
            // Mettre à jour via le service auth pour propager le changement
            this.auth.updateCurrentUser(user);
            this.editMode = false;
            alert('Profil mis à jour avec succès !');
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour du profil:', error);
            alert('Erreur lors de la mise à jour du profil');
          }
        });
    }
  }
}
