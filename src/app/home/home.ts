import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../Services/auth-service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit{

  _auth= inject(AuthService);
  userName = signal("")
  ngOnInit(){
    const user = this._auth.getUser();
    this.userName.set(user.name)
    
  }

  

}
