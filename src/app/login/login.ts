import { Component, inject, OnInit } from '@angular/core';
import { Navigation } from '../Services/navigation';
import { AuthService } from '../Services/auth-service';
import { UtilsService } from '../Services/utils';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login implements OnInit {
  private readonly _authService = inject(AuthService);
  private readonly _utils = inject(UtilsService);
  private readonly _fb = inject(FormBuilder);
  _nav = inject(Navigation);

  loginForm: FormGroup;

  constructor() {
    this.loginForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this._nav.hide();
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this._authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this._authService.saveSession(res);
        if (typeof this._nav.show === 'function') this._nav.show();
        this._nav.goToHome();
      },
      error: (err) => {
        this._utils.showToast('Erreur : ' + (err.error?.message || 'Email ou mot de passe incorrect'), 'error');
      },
    });
  }
}