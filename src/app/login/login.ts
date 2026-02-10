import { AfterViewInit, Component, inject } from '@angular/core';
import { Navigation } from '../Services/navigation';
declare let google: any;

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements AfterViewInit {
  _nav = inject(Navigation);
  ngAfterViewInit() {
    google.accounts.id.initialize({
      client_id:
        '123887637516-givp4aionno6svukrfksbvva00640rj5.apps.googleusercontent.com',
      callback: this.handleCredentialResponse.bind(this),
    });

    google.accounts.id.renderButton(document.getElementById('google-btn'), {
      theme: 'outline',
      size: 'large',
    });
  }

  handleCredentialResponse(response: any) {
    this._nav.user.set(response.credential);
    const userInfo = this.decodeToken(this._nav.user());
    console.log('User Info :', userInfo);
    console.log('token :', response.credential);
    console.log('Nom :', userInfo.name);
    console.log('Email :', userInfo.email);
    console.log('Photo :', userInfo.picture);
  }

  decodeToken(token: string) {
    return JSON.parse(atob(token.split('.')[1]));
  }
}
