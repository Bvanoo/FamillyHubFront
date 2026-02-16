import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7075/api/Auth';

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.clear();
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  // googleLogin(payload: any): Observable<any> {
  //   return this.http.post(`${this.apiUrl}/google`, payload);
  // }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  saveSession(response: any) {
    const token = response.token || response.Token || response.idToken;
    const user = response.user || response.User;

    if (token) {
      localStorage.setItem('token', token);
      console.log("Token enregistré avec succès :", token.substring(0, 10) + "...");
    } else {
      console.error("ERREUR CRITIQUE : Aucun token trouvé dans la réponse !", response);
    }

    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  getUser(): any {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    const user = JSON.parse(userStr);

    if (user.profilePictureUrl && !user.profilePictureUrl.startsWith('http')) {
      user.fullPictureUrl = `https://localhost:7075${user.profilePictureUrl}`;
    } else {
      user.fullPictureUrl = null;
    }
    return user;
  }

  updateProfile(userId: string, name: string, file: File | null): Observable<any> {
    const formData = new FormData();
    formData.append('name', name);
    if (file) {
      formData.append('file', file);
    }

    return this.http.post(`${this.apiUrl}/update-profile/${userId}`, formData);
  }
}