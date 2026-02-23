import { Component, inject } from '@angular/core';
import { Navigation } from '../Services/navigation';
import { AuthService } from '../Services/auth-service';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
/**
 * Implements the signup page where new users can create an account.
 * Manages the registration form, validates password confirmation, and logs the user in on successful registration.
 */
export class Signup {
  _nav = inject(Navigation);
  private readonly _authService = inject(AuthService);
  private readonly _fb = inject(FormBuilder);

  signupForm: FormGroup;

  /**
   * Builds the reactive signup form with fields and validation rules.
   * Ensures basic requirements such as minimum name length, valid email, and strong passwords are enforced before submission.
   */
  constructor() {
    this.signupForm = this._fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  /**
   * Validates that the password and confirmation fields contain the same value.
   * Returns a "mismatch" error when they differ so the form can surface appropriate feedback.
   *
   * Args:
   *   control: The form group containing the password and confirmPassword controls.
   *
   * Returns:
   *   null if the passwords match; otherwise, an object describing the mismatch error.
   */
  private passwordMatchValidator(
    control: AbstractControl,
  ): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  /**
   * Handles signup form submission and triggers user registration through the authentication service.
   * On success, it saves the session, restores navigation visibility, and redirects the new user to the calendar; on failure, it shows an error message.
   */
  onSignup() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    const { confirmPassword, ...signupData } = this.signupForm.value;

    this._authService.register(signupData).subscribe({
      next: (res) => {
        this._authService.saveSession(res);
        try {
          if (typeof (this._nav as any).show === 'function') {
            (this._nav as any).show();
          } else {
            (this._nav as any).isVisible = true;
          }
        } catch (e) {
          console.log(e);
        }
        this._nav.goToCalendar();
      },
      error: (err) => {
        alert(
          "Erreur d'inscription : " + (err.error?.message || 'Erreur serveur'),
        );
      },
    });
  }
}
