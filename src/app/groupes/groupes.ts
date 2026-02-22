import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GroupService } from '../Services/group-service';

@Component({
  selector: 'app-groupes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './groupes.html',
  styleUrls: ['./groupes.css']
})
export class Groupes implements OnInit {
  private groupService = inject(GroupService);
  private router = inject(Router);
  activeTab = signal<string>('my-groups');
  myGroups = signal<any[]>([]);
  searchResults = signal<any[]>([]);
  creationError = signal<string>(''); 
  searchQuery: string = '';
  newGroup = { name: '', description: '', isPublic: true };

  ngOnInit() {
    this.loadMyGroups();
  }

  loadMyGroups() {
    this.groupService.getMyGroups().subscribe({
      next: (groups) => this.myGroups.set(groups),
      error: (err) => console.error("Erreur de chargement", err)
    });
  }

  selectGroup(group: any) {
    this.router.navigate(['/groupe', group.id]);
  }

  search() {
    if (!this.searchQuery.trim()) {
      this.searchResults.set([]);
      return;
    }
    
    const filtered = this.myGroups().filter(g => 
      g.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    this.searchResults.set(filtered);
  }

  joinGroup(group: any) {
    this.groupService.requestJoin(group.id).subscribe({
      next: () => alert("Demande envoyée pour le groupe " + group.name),
      error: (err) => alert(err.error?.message || "Erreur lors de la demande")
    });
  }

  createGroup() {
    this.creationError.set(''); 
    if (!this.newGroup.name.trim()) return;

    this.groupService.createGroup({ 
      name: this.newGroup.name, 
      description: this.newGroup.description 
    }).subscribe({
      next: (group) => {
        alert("Groupe créé avec succès ! Code : " + group.inviteCode);
        this.newGroup = { name: '', description: '', isPublic: true };
        this.activeTab.set('my-groups');
        this.loadMyGroups();
      },
      error: (err) => {
        console.error("Erreur complète :", err);
        this.creationError.set(err.error?.message || err.message || "Erreur serveur");
      }
    });
  }
}