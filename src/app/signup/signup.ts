import { Component, inject } from '@angular/core';
import { Navigation } from '../Services/navigation';

@Component({
  selector: 'app-signup',
  imports: [],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {

  _nav = inject(Navigation)
}
