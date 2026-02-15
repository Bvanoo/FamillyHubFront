import { Component, inject, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Navigation } from '../Services/navigation';
import { CommonModule } from '@angular/common';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit, AfterViewInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  _nav = inject(Navigation);

  ngOnInit() {
    try {
      if (typeof (this._nav as any).hide === 'function') {
        (this._nav as any).hide();
      } else {
        (this._nav as any).isVisible = false; 
      }
    } catch (e) {
      console.warn("Impossible de masquer la navigation", e);
    }
  }

  ngAfterViewInit() {
    const btnElement = document.getElementById('google-btn');
    
    if (btnElement) {
      google.accounts.id.initialize({
        client_id: "123887637516-givp4aionno6svukrfksbvva00640rj5.apps.googleusercontent.com",
        callback: (response: any) => this.handleGoogleLogin(response),
        use_fedcm: false
      });

      google.accounts.id.renderButton(
        btnElement, 
        { 
          theme: 'outline', 
          size: 'large', 
          width: 350,
          text: 'signin_with' 
        }
      );
    }
  }

handleGoogleLogin(googleResponse: any) {
    const token = googleResponse.credential;
    const payload = { idToken: token };

    console.log('Envoi du payload au backend:', payload);

    this.http.post<any>('https://localhost:7075/api/login/google', payload)
    .subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('userId', res.user.id.toString());
        console.log('Connecté avec succès au backend !');
        try {
          if (typeof (this._nav as any).show === 'function') {
            (this._nav as any).show();
          } else {
            (this._nav as any).isVisible = true;
          }
        } catch (e) {
          console.error("Erreur toggle nav:", e);
        }

        this.router.navigate(['/calendar']);
      },
      error: (err) => {
        console.error('Erreur synchronisation backend', err);
        if (err.status === 400) {
          console.table(err.error);
        }
        alert("Erreur de connexion au serveur.");
      }
    });
  }
}