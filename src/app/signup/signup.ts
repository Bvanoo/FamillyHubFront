import { Component, inject } from '@angular/core';
import { Navigation } from '../Services/navigation';
import { AuthService } from '../Services/auth-service';
import { UtilsService } from '../Services/utils';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  _nav = inject(Navigation);
  private readonly _authService = inject(AuthService);
  private readonly _utils = inject(UtilsService);
  private readonly _fb = inject(FormBuilder);

  signupForm: FormGroup;

  constructor() {
    this.signupForm = this._fb.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSignup() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    const { confirmPassword, ...signupData } = this.signupForm.value;

    this._authService.register(signupData).subscribe({
      next: (res) => {
        this._authService.saveSession(res);
        try { if (typeof (this._nav as any).show === 'function') (this._nav as any).show(); else (this._nav as any).isVisible = true; } catch (e) {}
        this._nav.goToCalendar();
      },
      error: (err) => {
        this._utils.showToast("Erreur d'inscription : " + (err.error?.message || 'Erreur serveur'), 'error');
      },
    });
  }
}