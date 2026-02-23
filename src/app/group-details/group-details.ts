import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { GroupService } from '../Services/group-service';
import { SignalRService } from '../Services/signal-r';
import { AuthService } from '../Services/auth-service';
import { Navigation } from '../Services/navigation';
import { Calendar } from '../calendar/calendar';

@Component({
  selector: 'app-group-details',
  imports: [CommonModule, FormsModule, Calendar],
  templateUrl: './group-details.html',
  styleUrls: ['./group-details.css'],
})
export class GroupDetails implements OnInit, OnDestroy {
  private readonly _route = inject(ActivatedRoute);
  private readonly _groupService = inject(GroupService);
  private readonly _signalRService = inject(SignalRService);
  private readonly _authService = inject(AuthService);
  _nav = inject(Navigation);

  groupId!: number;
  currentUser: any;
  activeTab = signal<string>('chat');
  messages = signal<any[]>([]);
  members = signal<any[]>([]);
  isAdmin = signal<boolean>(false);
  newMessage: string = '';

  groupDetails: any = null;
  showInviteModal = signal(false);
  searchQuery = signal('');
  searchResults = signal<any[]>([]);
  isSearching = signal(false);

  /**
   * Initialisation du composant : récupération de l'ID, du user, du chat et des membres.
   */
  ngOnInit() {
    this.currentUser = this._authService.getUser();
    this.groupId = Number(this._route.snapshot.paramMap.get('id'));

    this.loadGroupInfo();
    this.initChat();
    this.loadMembers(); 
  }

  /**
   * Récupère les infos de base du groupe (Nom, description, etc.)
   */
  loadGroupInfo() {
    this._groupService.getGroupById(this.groupId).subscribe({
      next: (data) => this.groupDetails = data,
      error: (err) => console.error('Erreur lors du chargement du groupe', err)
    });
  }

  /**
   * Connexion au Chat via SignalR.
   */
  initChat() {
    this._signalRService.startConnection();
    this._signalRService.joinGroup(this.groupId);

    this._groupService.getGroupMessages(this.groupId).subscribe({
      next: (history) => this.messages.set(history),
      error: (err) => console.error('Erreur historique:', err),
    });

    this._signalRService.addMessageListener(
      (senderName, content, timestamp) => {
        this.messages.update((prev) => [
          ...prev,
          { senderName, content, timestamp },
        ]);
      },
    );
  }

loadMembers() {
    this._groupService.getGroupMembers(this.groupId).subscribe({
      next: (membres) => {
        this.members.set(membres); // Met à jour le signal instantanément
        
        // CORRECTION ICI : On utilise "==" au lieu de "===" pour éviter les bugs entre texte et nombre
        const myProfile = membres.find((m) => m.userId == this.currentUser.id);
        
        if (myProfile && myProfile.role === 'Admin') {
          this.isAdmin.set(true);
        } else {
          this.isAdmin.set(false); // S'assure de réinitialiser si on perd le rôle
        }
      },
      error: (err) => console.error('Erreur chargement membres:', err),
    });
  }

  inviteUser(user: any) {
    const targetUserId = user.id || user.Id;
    this._groupService.inviteUserToGroup(this.groupId, targetUserId).subscribe({
      next: () => {
        alert(`${user.name || user.Name} a été ajouté(e) au groupe avec succès !`);
        
        // Retire l'utilisateur des résultats de recherche
        this.searchResults.update(results => results.filter(u => (u.id || u.Id) !== targetUserId));
        
        // MISE À JOUR : On recharge la liste des membres pour le voir apparaître dans l'onglet Paramètres
        this.loadMembers(); 
      },
      error: (err) => {
        console.error("Erreur lors de l'ajout", err);
        alert("Impossible d'ajouter l'utilisateur.");
      }
    });
  }

  /**
   * Déconnexion de SignalR lors de la destruction du composant.
   */
  ngOnDestroy() {
    this._signalRService.leaveGroup(this.groupId);
  }

  /**
   * Envoi d'un message dans le chat du groupe.
   */
  sendMessage() {
    if (!this.newMessage.trim()) return;
    this._signalRService.sendMessageToGroup(
      this.groupId,
      this.newMessage,
      this.currentUser.id.toString(),
      this.currentUser.name,
    );
    this.newMessage = '';
  }

  /**
   * Suppression définitive du groupe (Action Admin).
   */
  deleteGroup() {
    if (
      confirm(
        'Êtes-vous sûr de vouloir supprimer définitivement ce groupe ? Cette action est irréversible.',
      )
    ) {
      this._groupService.deleteGroup(this.groupId).subscribe({
        next: () => {
          alert('Groupe supprimé.');
          this._nav.goToGroupes();
        },
        error: (err) =>
          alert(err.error?.message || 'Erreur lors de la suppression.'),
      });
    }
  }

  /**
   * Transfert des droits d'administration à un autre membre.
   */
  transferRole(newAdminId: number, memberName: string) {
    if (
      confirm(
        `Voulez-vous transférer vos droits d'Admin à ${memberName} ? Vous deviendrez un membre normal.`,
      )
    ) {
      this._groupService.transferAdmin(this.groupId, newAdminId).subscribe({
        next: () => {
          alert(`Les droits ont été transférés à ${memberName}.`);
          this.isAdmin.set(false);
          this.activeTab.set('chat');
          this.loadMembers();
        },
        error: (err) =>
          alert(err.error?.message || 'Erreur lors du transfert.'),
      });
    }
  }

  openInviteModal() {
    this.showInviteModal.set(true);
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.searchUsers();
  }

  closeInviteModal() {
    this.showInviteModal.set(false);
  }

  searchUsers() {
    this.isSearching.set(true);
    const querySafe = this.searchQuery() ? this.searchQuery().trim() : '';
    
    this._groupService.searchUsersNotInGroup(this.groupId, querySafe).subscribe({
      next: (users) => {
        this.searchResults.set(users);
        this.isSearching.set(false);
      },
      error: (err) => {
        console.error('Erreur lors de la recherche', err);
        this.isSearching.set(false);
      }
    });
  }
  /**
   * Retire un membre du groupe (Action Admin).
   */
  removeMember(userId: number, memberName: string) {
    if (confirm(`Êtes-vous sûr de vouloir retirer ${memberName} du groupe ?`)) {
      this._groupService.removeMemberFromGroup(this.groupId, userId).subscribe({
        next: () => {
          alert(`${memberName} a été retiré(e) du groupe.`);
          this.loadMembers();
        },
        error: (err) => {
          console.error("Erreur lors du retrait du membre", err);
          alert("Impossible de retirer ce membre.");
        }
      });
    }
  }
}