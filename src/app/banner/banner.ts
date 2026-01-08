import { Component, inject, signal } from '@angular/core';
import { Navigation } from '../Services/navigation';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-banner',
  imports: [CommonModule],
  templateUrl: './banner.html',
  styleUrl: './banner.css',
})
export class Banner {

  _Nav = inject(Navigation)
  _Router = inject(Router)

  currentUrl = signal('');

  ngOnInit(): void {
    this._Router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentUrl.set(event.urlAfterRedirects);
      });
    this.currentUrl.set(this._Router.url);
  }
  hasRoute(path: string): boolean {
    return this.currentUrl().includes(path);
  }
}
