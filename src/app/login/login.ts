import { Component, inject, OnInit } from '@angular/core';
import { Navigation } from '../Services/navigation';
import { AuthService } from '../Services/auth-service';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
/**
 * Provides the login page where users can authenticate with their email and password.
 * Manages the reactive login form, hides global navigation while unauthenticated, and restores navigation on success.
 */
export class Login implements OnInit {
  private readonly _authService = inject(AuthService);
  private readonly _fb = inject(FormBuilder);
  _nav = inject(Navigation);

  loginForm: FormGroup;

  /**
   * Sets up the reactive login form with validation rules for email and password.
   * Ensures user input is validated before any authentication attempt is made.
   */
  constructor() {
    this.loginForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  /**
   * Runs when the login component is initialized. Hides the global navigation so the focus stays
   * on authentication until the user has successfully logged in.
   */
  ngOnInit() {
    this._nav.hide();
  }

  /**
   * Handles the login form submission and triggers authentication against the backend.
   * On success, it saves the user session, re-displays the navigation, and redirects to the home page; on failure, it surfaces an error message.
   */
  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this._authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this._authService.saveSession(res);

        if (typeof this._nav.show === 'function') {
          this._nav.show();
        }
        this._nav.goToHome();
      },
      error: (err) => {
        console.error(err);
        alert(
          'Erreur : ' +
            (err.error?.message || 'Email ou mot de passe incorrect'),
        );
      },
    });
  }
}
