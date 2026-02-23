import { Component, inject, OnInit } from '@angular/core';
import { Navigation } from '../Services/navigation';
import { AuthService } from '../Services/auth-service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  _nav = inject(Navigation);

  loginForm: FormGroup;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
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

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.authService.saveSession(res);

        if (typeof this._nav.show === 'function') {
          this._nav.show(); 
        } else { 
          this._nav.show();
        }

        this._nav.goToHome();
      },
      error: (err) => {
        console.error(err);
        alert("Erreur : " + (err.error?.message || "Email ou mot de passe incorrect"));
      }
    });
  }
}