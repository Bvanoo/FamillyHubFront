import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Banner } from "./banner/banner";
import { CommonModule } from '@angular/common';
import { Navigation } from './Services/navigation';
import { filter } from 'rxjs';
import { Utils } from './utils/utils';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Banner, CommonModule, Utils],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('FamillyHub');
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
