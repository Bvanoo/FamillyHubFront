import { Component, inject } from '@angular/core';
import { Navigation } from '../Services/navigation';
import { AuthService } from '../Services/auth-service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nouveaumdp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './nouveaumdp.html',
  styleUrl: './nouveaumdp.css',
})
export class Nouveaumdp {
  _nav = inject(Navigation);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  forgotPasswordForm: FormGroup;
  message: string = '';

  constructor() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    const email = this.forgotPasswordForm.get('email')?.value;

    this.authService.forgotPassword(email).subscribe({
      next: (res) => {
        this.message = "Si cet email existe, vous recevrez un lien de réinitialisation.";
      },
      error: (err) => {
        this.message = "Une erreur est survenue.";
      }
    });
  }
}