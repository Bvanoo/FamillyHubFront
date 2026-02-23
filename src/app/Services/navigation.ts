import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
@Injectable({
  providedIn: 'root',
})
/**
 * Centralizes navigation and layout visibility concerns across the application.
 * Exposes convenient helpers for routing to key pages and toggling the global navigation bar.
 */
export class Navigation {
  _router = inject(Router);
  _location = inject(Location);

  isVisible = signal(true);
  userName = signal('aaa');
  user = signal('aaa');

  /**
   * Shows the global navigation element wherever it is bound to the isVisible signal.
   */
  show() {
    this.isVisible.set(true);
  }
  /**
   * Hides the global navigation element, typically used on authentication or standalone pages.
   */
  hide() {
    this.isVisible.set(false);
  }

  /**
   * Navigates back to the previous location in the browser history.
   */
  goBack(): void {
    this._location.back();
  }

  /**
   * Navigates to the home page of the application.
   */
  goToHome() {
    this._router.navigate(['/home']);
  }
  /**
   * Navigates to the signup/registration page.
   */
  goToSignup() {
    this._router.navigate(['/signup']);
  }
  /**
   * Navigates to the login page for user authentication.
   */
  goToLogin() {
    this._router.navigate(['/login']);
  }
  /**
   * Navigates to the "forgot/new password" page.
   */
  goToNouveaumdp() {
    this._router.navigate(['/nouveaumdp']);
  }
  /**
   * Navigates to the messenger or chat page.
   */
  goToMessenger() {
    this._router.navigate(['/messenger']);
  }
  /**
   * Navigates to the randomizer feature page.
   */
  goToRandomizer() {
    this._router.navigate(['/randomizer']);
  }
  /**
   * Navigates to the user profile page.
   */
  goToProfil() {
    this._router.navigate(['/profil']);
  }
  /**
   * Navigates to the groups overview page.
   */
  goToGroupes() {
    this._router.navigate(['/groupes']);
  }
  /**
   * Navigates to the main calendar page.
   */
  goToCalendar() {
    this._router.navigate(['/calendar']);
  }
  /**
   * Navigates to the detail page of a specific group.
   *
   * Args:
   *   id: The identifier of the group whose detail view should be opened.
   */
  goToGroupDetail(id: number) {
    this._router.navigate(['/groupe', id]);
  }
}
