import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../Services/auth-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navigation } from '../Services/navigation';

@Component({
  selector: 'app-profil',
  imports: [CommonModule, FormsModule],
  templateUrl: './profil.html',
  styleUrl: './profil.css',
})

/**
 * Displays and manages the user's profile, including basic information and profile picture.
 * Keeps local profile state in sync with the backend and provides actions to update details or log out.
 */
export class Profil implements OnInit {
  private readonly _auth = inject(AuthService);
  _nav = inject(Navigation);

  formName: string = '';
  selectedFile: File | null = null;
  userData = signal<any>({ name: '', email: '', id: 0 });
  previewUrl = signal<string | null>(null);
  isSaving = false;
  urlPic = computed(() => {
    return (
      this.previewUrl() ||
      this.userData().fullPictureUrl ||
      'https://ui-avatars.com/api/?name=' + (this.userData().name || 'User') + '&background=random&size=150'
    );
  });

  /**
   * Initializes the profile view with the currently authenticated user's data. Prefills the form
   * fields and sets up the profile picture preview if a custom image already exists.
   */
  ngOnInit() {
    const user = this._auth.getUser();
    if (user) {
      this.userData.set(user);
      this.formName = user.name;

      if (user.fullPictureUrl) {
        this.previewUrl.set(`${user.fullPictureUrl}?t=${Date.now()}`);
      }
    }
  }

  /**
   * Handles selection of a new profile picture file from the user's device. Stores the chosen file
   * and generates a local preview so the user can see the image before saving changes.
   */
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => this.previewUrl.set(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  /**
   * Persists profile changes, including name and optional profile picture, to the backend. Updates
   * local storage and component state on success, and gives feedback to the user about the result.
   */
  saveChanges() {
    this.isSaving = true;
    const id = this.userData().id;
    const name = this.formName;

    this._auth.updateProfile(id.toString(), name, this.selectedFile).subscribe({
      next: (res) => {
        localStorage.setItem('user', JSON.stringify(res));
        const updatedUser = this._auth.getUser();
        this.userData.set(updatedUser);
        this.selectedFile = null;

        alert('Profil mis à jour !');
        this.isSaving = false;
        window.location.reload();
      },
      error: (err) => {
        console.error(err);
        alert('Erreur lors de la sauvegarde');
        this.isSaving = false;
      },
    });
  }

  /**
   * Logs the user out from the application and redirects them to the login page.
   * Also hides any navigation elements that should not be visible when unauthenticated.
   */
  logout() {
    this._auth.logout();
    this._nav.hide();
    this._nav.goToLogin();
  }
}
