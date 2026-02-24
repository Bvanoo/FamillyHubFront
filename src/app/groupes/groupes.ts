import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GroupService } from '../Services/group-service';
import { Navigation } from '../Services/navigation';

@Component({
  selector: 'app-groupes',
  imports: [CommonModule, FormsModule],
  templateUrl: './groupes.html',
  styleUrls: ['./groupes.css'],
})
export class Groupes implements OnInit {
  private readonly _groupService = inject(GroupService);
  _nav = inject(Navigation);

  activeTab = signal<string>('my-groups');
  myGroups = signal<any[]>([]);
  searchResults = signal<any[]>([]);
  randomPublicGroups = signal<any[]>([]);

  creationError = signal<string>('');
  isCreating = signal<boolean>(false);

  searchQuery: string = '';
  newGroup = { name: '', description: '', isPublic: true };

  ngOnInit() {
    this.loadMyGroups();
    this.loadRandomPublicGroups();
  }

  loadMyGroups() {
    this._groupService.getMyGroups().subscribe({
      next: (groups) => this.myGroups.set(groups),
      error: (err) => console.error('Erreur de chargement', err),
    });
  }

  loadRandomPublicGroups() {
    this._groupService.getRandomPublicGroups().subscribe({
      next: (groups) => this.randomPublicGroups.set(groups),
      error: (err) => console.error('Erreur de chargement des suggestions', err)
    });
  }

  search() {
    if (!this.searchQuery.trim()) {
      this.searchResults.set([]);
      return;
    }
    const filtered = this.myGroups().filter((g) =>
      g.name.toLowerCase().includes(this.searchQuery.toLowerCase()),
    );
    this.searchResults.set(filtered);
  }

  joinGroup(group: any) {
    this._groupService.requestJoin(group.id).subscribe({
      next: () => {
        alert('Demande envoyée pour le groupe ' + group.name);
        this.loadRandomPublicGroups();
      },
      error: (err) => alert(err.error?.message || 'Erreur lors de la demande'),
    });
  }

  createGroup() {
    this.creationError.set('');
    
    if (!this.newGroup.name.trim() || this.isCreating()) return;

    this.isCreating.set(true);

    this._groupService
      .createGroup({
        name: this.newGroup.name,
        description: this.newGroup.description,
      })
      .subscribe({
        next: (group) => {
          alert('Groupe créé avec succès ! Code : ' + group.inviteCode);
          this.newGroup = { name: '', description: '', isPublic: true };
          this.activeTab.set('my-groups');
          this.loadMyGroups();
          this.loadRandomPublicGroups();
          this.isCreating.set(false);
        },
        error: (err) => {
          console.error('Erreur complète :', err);
          this.creationError.set(err.error?.message || err.message || 'Erreur serveur');
          this.isCreating.set(false);
        },
      });
  }
}