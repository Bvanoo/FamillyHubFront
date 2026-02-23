import { Component, inject, signal, OnInit } from '@angular/core';
import { Navigation } from '../Services/navigation';
import { AuthService } from '../Services/auth-service';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-banner',
  imports: [CommonModule],
  templateUrl: './banner.html',
  styleUrl: './banner.css',
})
export class Banner implements OnInit {
  _nav = inject(Navigation);
  _router = inject(Router);
  _auth = inject(AuthService);

  currentUrl = signal('');
  currentUser: any = null;

  /**
   * Initializes the banner component when it is first created. Sets up initial user data and
   * subscribes to router events to keep the banner state in sync with navigation changes.
   */
  ngOnInit() {
    this.loadUserData();
    this._router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.loadUserData();
        this.currentUrl.set(this._router.url);
      });
  }

  /**
   * Checks whether the current URL contains the specified path segment. This helps determine
   * if a particular route is currently active or relevant for the banner display.
   *
   * Args:
   *   path: The path segment to check for within the current URL.
   *
   * Returns:
   *   true if the current URL includes the given path segment; otherwise, false.
   */
  hasRoute(path: string): boolean {
    return this.currentUrl().includes(path);
  }
  /**
   * Loads the current authenticated user's data into the banner component. Ensures that the
   * user's profile picture URL is refreshed so that the latest image is displayed.
   */
  loadUserData() {
    const user = this._auth.getUser();
    if (user) {
      if (user.fullPictureUrl) {
        user.fullPictureUrl = `${user.fullPictureUrl}?t=${new Date().getTime()}`;
      }
      this.currentUser = user;
    }
  }
  /**
   * Logs the current user out of the application and updates the banner to reflect the
   * unauthenticated state. After logging out, it redirects the user to the login page.
   */
  handleLogout() {
    this._auth.logout();
    this._router.navigate(['/login']);
  }
}
