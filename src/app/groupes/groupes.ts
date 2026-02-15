import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GroupService } from '../Services/group-service';

@Component({
  selector: 'app-groupes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './groupes.html',
  styleUrls: ['./groupes.css'],
})
export class Groupes implements OnInit {
  private groupService = inject(GroupService);
  
  userId = 1; 
  myGroups: any[] = [];
  searchResults: any[] = [];
  searchQuery = '';
  activeTab: 'my-groups' | 'search' | 'create' = 'my-groups';
  newGroup = { 
    name: '', 
    description: '', 
    isPublic: true, 
    ownerId: 0,
    iconUrl: 'assets/icons/house.png'
  };

  ngOnInit() {
    this.loadMyGroups();
    this.newGroup.ownerId = this.userId;
  }

  loadMyGroups() {
    this.groupService.getMyGroups(this.userId).subscribe(groups => {
      this.myGroups = groups;
    });
  }

  search() {
    if (!this.searchQuery.trim()) return;
    this.groupService.searchGroups(this.searchQuery).subscribe(results => {
      this.searchResults = results;
    });
  }

  createGroup() {
    this.newGroup.ownerId = this.userId;
    if (!this.newGroup.iconUrl) {
        this.newGroup.iconUrl = 'assets/icons/default.png';
    }

    this.groupService.createGroup(this.newGroup).subscribe({
      next: (g) => {
        alert('Groupe créé avec succès !');
        this.activeTab = 'my-groups';
        this.loadMyGroups();
        this.newGroup = { 
            name: '', 
            description: '', 
            isPublic: true, 
            ownerId: this.userId,
            iconUrl: 'assets/icons/house.png' 
        };
      },
      error: (e) => {
        console.error('Erreur création groupe:', e);
        alert('Erreur lors de la création. Vérifiez les champs.');
      }
    });
  }

  joinGroup(group: any) {
    if(confirm(`Rejoindre "${group.name}" ?`)) {
      this.groupService.joinGroup(group.id, this.userId).subscribe({
        next: () => {
          alert('Demande envoyée !');
          this.loadMyGroups();
        },
        error: (err) => alert("Erreur ou déjà membre")
      });
    }
  }
}