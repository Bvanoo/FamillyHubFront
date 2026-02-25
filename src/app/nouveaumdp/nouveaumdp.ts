import { Component, inject } from '@angular/core';
import { Navigation } from '../Services/navigation';
import { AuthService } from '../Services/auth-service';
import { UtilsService } from '../Services/utils';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nouveaumdp',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './nouveaumdp.html',
  styleUrl: './nouveaumdp.css',
})
export class Nouveaumdp {
  _nav = inject(Navigation);
  private readonly _authService = inject(AuthService);
  private readonly _utils = inject(UtilsService);
  private readonly _fb = inject(FormBuilder);

  forgotPasswordForm: FormGroup;
  message: string = '';

  constructor() {
    this.forgotPasswordForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    const email = this.forgotPasswordForm.get('email')?.value;

    this._authService.forgotPassword(email).subscribe({
      next: (res) => {
        this.message = "Si cet email existe, vous recevrez un lien de réinitialisation.";
        this._utils.showToast(this.message, "success");
      },
      error: (err) => {
        this.message = "Une erreur est survenue.";
        this._utils.showToast(this.message, "error");
      }
    });
  }
}