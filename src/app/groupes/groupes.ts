import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GroupService } from '../Services/group-service';
import { UtilsService } from '../Services/utils';
import { Navigation } from '../Services/navigation';

@Component({
  selector: 'app-groupes',
  imports: [CommonModule, FormsModule],
  templateUrl: './groupes.html',
  styleUrls: ['./groupes.css'],
})
export class Groupes implements OnInit {
  private readonly _groupService = inject(GroupService);
  private readonly _utils = inject(UtilsService);
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
        this._utils.showToast('Demande envoyée pour ' + group.name, 'success');
        this.loadRandomPublicGroups();
      },
      error: (err) => this._utils.showToast(err.error?.message || 'Erreur lors de la demande', 'error'),
    });
  }

  createGroup() {
    this.creationError.set('');
    if (!this.newGroup.name.trim() || this.isCreating()) return;
    this.isCreating.set(true);

    this._groupService.createGroup({ name: this.newGroup.name, description: this.newGroup.description }).subscribe({
      next: (group) => {
        this._utils.showToast('Groupe créé ! Code : ' + group.inviteCode, 'success');
        this.newGroup = { name: '', description: '', isPublic: true };
        this.activeTab.set('my-groups');
        this.loadMyGroups();
        this.loadRandomPublicGroups();
        this.isCreating.set(false);
      },
      error: (err) => {
        this.creationError.set(err.error?.message || 'Erreur serveur');
        this.isCreating.set(false);
      },
    });
  }
}