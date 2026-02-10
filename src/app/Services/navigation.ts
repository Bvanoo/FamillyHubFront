import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
@Injectable({
  providedIn: 'root',
})
export class Navigation {

  _router = inject(Router);
  _location = inject(Location);
 
  userName= signal("");
  user= signal("");


  goBack(): void {
    this._location.back();
  }
  goToHome() {
    this._router.navigate(['/home']);
  }
  goToSignup() {
    this._router.navigate(['/signup']);
  }
  goToLogin() {
    this._router.navigate(['/login']);
  }
  goToNouveaumdp() {
    this._router.navigate(['/nouveaumdp']);
  }
  goToMessenger() {
    this._router.navigate(['/messenger']);
  }
  goToRandomizer() {
    this._router.navigate(['/randomizer']);
  }
  goToProfil() {
    this._router.navigate(['/profil']);
  }
  goToGroupes() {
    this._router.navigate(['/groupes']);
  }
  goToCalendar() {
    this._router.navigate(['/calendar']);
  }
}
