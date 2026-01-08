import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
@Injectable({
  providedIn: 'root',
})
export class Navigation {

  _router = inject(Router);
  _location = inject(Location);
  userName= signal("azaz");

  goBack(): void {
    this._location.back();
  }
  goToHome() {
    this._router.navigate(['/home']);
  }
  goToCalendar() {
    this._router.navigate(['/calendar']);
  }
}
