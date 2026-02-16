import { Component, inject, OnInit } from '@angular/core';
import { Navigation } from '../Services/navigation';
import { AuthService } from '../Services/auth-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {
  private authService = inject(AuthService);
  _nav = inject(Navigation);

  loginData = {
    email: '',
    password: ''
  };

  ngOnInit() {
    this._nav.hide();
  }

onLogin() {

  if (!this.loginData.email || !this.loginData.password) {
    alert("Veuillez remplir tous les champs");
    return;
  }

  this.authService.login(this.loginData).subscribe({
    next: (res) => {
      this.authService.saveSession(res);

        if (typeof this._nav.show === 'function') {
          this._nav.show(); 
        }
        else { 
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