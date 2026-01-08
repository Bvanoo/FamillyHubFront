import { Component, inject } from '@angular/core';
import { Navigation } from '../Services/navigation';

@Component({
  selector: 'app-nouveaumdp',
  imports: [],
  templateUrl: './nouveaumdp.html',
  styleUrl: './nouveaumdp.css',
})
export class Nouveaumdp {

  _nav = inject(Navigation)
}
