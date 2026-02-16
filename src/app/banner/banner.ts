import { Component, inject, signal, OnInit } from '@angular/core';
import { Navigation } from '../Services/navigation';
import { AuthService } from '../Services/auth-service';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner.html',
  styleUrl: './banner.css',
})
export class Banner implements OnInit {

  _nav = inject(Navigation);
  _router = inject(Router);
  private _auth = inject(AuthService);

  currentUrl = signal('');
  currentUser: any = null;

  ngOnInit(): void {
    this.loadUserData();
    this._router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.loadUserData();
        this.currentUrl.set(this._router.url);
      });
  }
  hasRoute(path: string): boolean {
    return this.currentUrl().includes(path);
  }
  loadUserData() {
    const user = this._auth.getUser();
    if (user) {
      if (user.fullPictureUrl) {
        user.fullPictureUrl = `${user.fullPictureUrl}?t=${new Date().getTime()}`;
      }
      this.currentUser = user;
    }
  }
  handleLogout() {
    this._auth.logout();
    this._router.navigate(['/login']);
  }
}