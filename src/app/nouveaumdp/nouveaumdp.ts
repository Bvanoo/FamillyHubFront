import { Component, inject } from '@angular/core';
import { Navigation } from '../Services/navigation';
import { AuthService } from '../Services/auth-service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nouveaumdp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nouveaumdp.html',
  styleUrl: './nouveaumdp.css',
})
export class Nouveaumdp {
  _nav = inject(Navigation);
  private authService = inject(AuthService);

  email: string = '';
  message: string = '';

  onSubmit() {
    if (!this.email) return;

    this.authService.forgotPassword(this.email).subscribe({
      next: (res) => {
        this.message = "Si cet email existe, vous recevrez un lien de réinitialisation.";
      },
      error: (err) => {
        this.message = "Une erreur est survenue.";
      }
    });
  }
}