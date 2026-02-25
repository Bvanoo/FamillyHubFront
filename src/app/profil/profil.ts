import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../Services/auth-service';
import { UtilsService } from '../Services/utils';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navigation } from '../Services/navigation';

@Component({
  selector: 'app-profil',
  imports: [CommonModule, FormsModule],
  templateUrl: './profil.html',
  styleUrl: './profil.css',
})
export class Profil implements OnInit {
  private readonly _auth = inject(AuthService);
  private readonly _utils = inject(UtilsService);
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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => this.previewUrl.set(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  saveChanges() {
    this.isSaving = true;
    const id = this.userData().id;
    const name = this.formName;

    this._auth.updateProfile(id.toString(), name, this.selectedFile).subscribe({
      next: (res) => {
        localStorage.setItem('user', JSON.stringify(res));
        this.userData.set(this._auth.getUser());
        this.selectedFile = null;

        this._utils.showToast('Profil mis à jour !', 'success');
        this.isSaving = false;
        setTimeout(() => window.location.reload(), 1500);
      },
      error: (err) => {
        this._utils.showToast('Erreur lors de la sauvegarde', 'error');
        this.isSaving = false;
      },
    });
  }

  logout() {
    this._auth.logout();
    this._nav.hide();
    this._nav.goToLogin();
  }
}