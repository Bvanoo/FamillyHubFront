import { Component, inject } from '@angular/core';
import { Navigation } from '../Services/navigation';
import { AuthService } from '../Services/auth-service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nouveaumdp',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './nouveaumdp.html',
  styleUrl: './nouveaumdp.css',
})

/**
 * Provides the "forgot password" page where users can request a reset link via email.
 * Manages the reset request form, validates user input, and surfaces feedback based on the backend response.
 */
export class Nouveaumdp {
  _nav = inject(Navigation);
  private readonly _authService = inject(AuthService);
  private readonly _fb = inject(FormBuilder);

  forgotPasswordForm: FormGroup;
  message: string = '';

  /**
   * Initializes the forgot-password form with validation rules for the email field.
   * Ensures only syntactically valid email addresses can be submitted to the reset endpoint.
   */
  constructor() {
    this.forgotPasswordForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  /**
   * Handles submission of the forgot-password form and triggers the reset-email request.
   * Validates the form, calls the backend, and updates the user-facing message according to the outcome.
   */
  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    const email = this.forgotPasswordForm.get('email')?.value;

    this._authService.forgotPassword(email).subscribe({
      next: (res) => {
        this.message = "Si cet email existe, vous recevrez un lien de réinitialisation.";
      },
      error: (err) => {
        this.message = "Une erreur est survenue.";
      }
    });
  }
}