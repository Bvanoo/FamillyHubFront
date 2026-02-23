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
/**
 * Manages the groups overview page where users can view, search, join, and create groups.
 * Maintains reactive state for the user's groups, search results, and any creation errors shown in the UI.
 */
export class Groupes implements OnInit {
  private readonly _groupService = inject(GroupService);
  _nav = inject(Navigation);

  activeTab = signal<string>('my-groups');
  myGroups = signal<any[]>([]);
  searchResults = signal<any[]>([]);
  creationError = signal<string>('');
  searchQuery: string = '';
  newGroup = { name: '', description: '', isPublic: true };

  /**
   * Initializes the groups view when it is first displayed. Loads the list of groups that the
   * current user belongs to so the main tab has meaningful content.
   */
  ngOnInit() {
    this.loadMyGroups();
  }

  /**
   * Retrieves the groups associated with the current user and stores them in local state.
   * Used both on initial load and after actions that may change the membership list.
   */
  loadMyGroups() {
    this._groupService.getMyGroups().subscribe({
      next: (groups) => this.myGroups.set(groups),
      error: (err) => console.error('Erreur de chargement', err),
    });
  }

  /**
   * Filters the user's groups based on the current search query. Updates the search results so
   * the UI can show only groups whose names match the entered text.
   */
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

  /**
   * Sends a join request for the specified group on behalf of the current user. Provides basic
   * feedback via alerts to indicate whether the request was successfully submitted or failed.
   */
  joinGroup(group: any) {
    this._groupService.requestJoin(group.id).subscribe({
      next: () => alert('Demande envoyée pour le groupe ' + group.name),
      error: (err) => alert(err.error?.message || 'Erreur lors de la demande'),
    });
  }

  /**
   * Creates a new group using the details entered in the form. On success, it clears the form,
   * switches back to the user's groups tab, refreshes the list, and surfaces any errors when creation fails.
   */
  createGroup() {
    this.creationError.set('');
    if (!this.newGroup.name.trim()) return;

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
        },
        error: (err) => {
          console.error('Erreur complète :', err);
          this.creationError.set(
            err.error?.message || err.message || 'Erreur serveur',
          );
        },
      });
  }
}
