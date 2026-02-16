import { Component, inject } from '@angular/core';
import { Navigation } from '../Services/navigation';
import { AuthService } from '../Services/auth-service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  _nav = inject(Navigation);
  private authService = inject(AuthService);
  private router = inject(Router);

  signupData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  onSignup() {
    if (this.signupData.password !== this.signupData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    this.authService.register(this.signupData).subscribe({
      next: (res) => {
        this.authService.saveSession(res);
        try {
            if (typeof (this._nav as any).show === 'function') { (this._nav as any).show(); }
            else { (this._nav as any).isVisible = true; }
        } catch (e) {}
        this.router.navigate(['/calendar']);
      },
      error: (err) => {
        alert("Erreur d'inscription : " + (err.error?.message || "Erreur serveur"));
      }
    });
  }
}