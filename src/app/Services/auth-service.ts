import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

/**
 * Centralizes authentication and user session management for the application.
 * Provides methods for logging in, registering, handling password resets, managing profile data, and checking authentication state.
 */
export class AuthService {
  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = 'https://localhost:7075/api/Auth';

  /**
   * Authenticates a user with the provided credentials against the backend API.
   * Returns an observable carrying token and user information used to establish a session.
   *
   * Args:
   *   credentials: The login data, typically containing email/username and password.
   *
   * Returns:
   *   An observable emitting the authentication response from the server.
   */
  login(credentials: any): Observable<any> {
    return this._http.post(`${this._apiUrl}/login`, credentials);
  }

  /**
   * Ends the current user session on the client side. Clears stored authentication
   * token and user information from local storage.
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.clear();
  }

  /**
   * Registers a new user account with the backend using the provided data.
   * Returns an observable so callers can react to success or validation errors.
   *
   * Args:
   *   data: The registration payload containing required user details.
   *
   * Returns:
   *   An observable emitting the registration result from the server.
   */
  register(data: any): Observable<any> {
    return this._http.post(`${this._apiUrl}/register`, data);
  }

  // googleLogin(payload: any): Observable<any> {
  //   return this.http.post(`${this.apiUrl}/google`, payload);
  // }

  /**
   * Initiates the forgot-password flow by requesting a reset email for the given address.
   * The server responds generically so callers do not learn whether the email exists.
   *
   * Args:
   *   email: The email address for which a password reset is requested.
   *
   * Returns:
   *   An observable emitting the server's response to the reset request.
   */
  forgotPassword(email: string): Observable<any> {
    return this._http.post(`${this._apiUrl}/forgot-password`, { email });
  }

  /**
   * Stores authentication details from a login or registration response into local storage.
   * Extracts the token and user object from various possible response shapes to keep the session consistent.
   *
   * Args:
   *   response: The raw response object returned by the authentication API.
   *
   * Returns:
   *   void
   */
  saveSession(response: any) {
    const token = response.token || response.Token || response.idToken;
    const user = response.user || response.User;

    if (token) {
      localStorage.setItem('token', token);
      console.log(
        'Token enregistré avec succès :',
        token.substring(0, 10) + '...',
      );
    } else {
      console.error(
        'ERREUR CRITIQUE : Aucun token trouvé dans la réponse !',
        response,
      );
    }

    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  /**
   * Retrieves the current user from local storage and enriches it with a full picture URL if applicable.
   * Returns null when no user is stored, allowing callers to detect unauthenticated states.
   *
   * Returns:
   *   The user object with a computed fullPictureUrl field, or null if no user is stored.
   */
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

  /**
   * Updates a user's profile information, optionally including a new profile picture.
   * Sends multipart form data so the backend can process both text and file content.
   *
   * Args:
   *   userId: The identifier of the user whose profile is being updated.
   *   name: The new display name to associate with the user.
   *   file: An optional image file to use as the new profile picture.
   *
   * Returns:
   *   An observable emitting the updated user data from the server.
   */
  updateProfile(
    userId: string,
    name: string,
    file: File | null,
  ): Observable<any> {
    const formData = new FormData();
    formData.append('name', name);
    if (file) {
      formData.append('file', file);
    }

    return this._http.post(
      `${this._apiUrl}/update-profile/${userId}`,
      formData,
    );
  }

  /**
   * Returns the raw authentication token stored on the client, if any.
   *
   * Returns:
   *   The stored token string, or null if no token is present.
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Indicates whether the client currently considers the user authenticated.
   * This is based solely on the presence of a stored token, not its validity or expiration.
   *
   * Returns:
   *   true if a token is present in storage; otherwise, false.
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }
}
