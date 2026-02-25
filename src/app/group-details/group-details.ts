import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { GroupService } from '../Services/group-service';
import { SignalRService } from '../Services/signal-r';
import { AuthService } from '../Services/auth-service';
import { UtilsService } from '../Services/utils';
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
  private readonly _utils = inject(UtilsService);
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
  secretSantaState = signal<any>({ isDrawn: false, isRevealed: false });

  ngOnInit() {
    this.currentUser = this._authService.getUser();
    this.groupId = Number(this._route.snapshot.paramMap.get('id'));

    this.loadGroupInfo();
    this.initChat();
    this.loadMembers();
    this.loadMySecretSantaTarget();
  }

  loadGroupInfo() {
    this._groupService.getGroupById(this.groupId).subscribe({
      next: (data) => (this.groupDetails = data),
      error: (err) => console.error('Erreur lors du chargement du groupe', err),
    });
  }

  initChat() {
    this._signalRService.startConnection().then(() => {
        this._signalRService.joinGroup(this.groupId);
        this._signalRService.addMessageListener((senderName, content, timestamp) => {
            this.messages.update((prev) => [...prev, { senderName, content, timestamp }]);
          });
      }).catch((err) => console.error('Impossible de se connecter au chat', err));
      
    this._groupService.getGroupMessages(this.groupId).subscribe({
      next: (history) => this.messages.set(history),
      error: (err) => console.error('Erreur historique:', err),
    });
  }

  loadMembers() {
    this._groupService.getGroupMembers(this.groupId).subscribe({
      next: (membres) => {
        this.members.set(membres);
        const myProfile = membres.find((m) => m.userId == this.currentUser.id);
        if (myProfile && myProfile.role === 'Admin') this.isAdmin.set(true);
        else this.isAdmin.set(false);
      },
      error: (err) => console.error('Erreur chargement membres:', err),
    });
  }

  inviteUser(user: any) {
    const targetUserId = user.id || user.Id;
    this._groupService.inviteUserToGroup(this.groupId, targetUserId).subscribe({
      next: () => {
        this._utils.showToast(`${user.name || user.Name} a été ajouté(e) au groupe !`, 'success');
        this.searchResults.update((res) => res.filter((u) => (u.id || u.Id) !== targetUserId));
        this.loadMembers();
      },
      error: () => this._utils.showToast("Impossible d'ajouter l'utilisateur.", 'error'),
    });
  }

  ngOnDestroy() {
    this._signalRService.leaveGroup(this.groupId);
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;
    this._signalRService.sendMessageToGroup(this.groupId, this.newMessage, this.currentUser.id.toString(), this.currentUser.name);
    this.newMessage = '';
  }

  deleteGroup() {
    this._utils.openConfirm('Supprimer le groupe', 'Êtes-vous sûr de vouloir supprimer définitivement ce groupe ?', () => {
      this._groupService.deleteGroup(this.groupId).subscribe({
        next: () => {
          this._utils.showToast('Groupe supprimé.', 'success');
          setTimeout(() => this._nav.goToGroupes(), 1000);
        },
        error: (err) => this._utils.showToast(err.error?.message || 'Erreur lors de la suppression.', 'error')
      });
    });
  }

  transferRole(newAdminId: number, memberName: string) {
    this._utils.openConfirm('Transférer les droits', `Voulez-vous transférer vos droits d'Admin à ${memberName} ?`, () => {
      this._groupService.transferAdmin(this.groupId, newAdminId).subscribe({
        next: () => {
          this._utils.showToast(`Droits transférés à ${memberName}.`, 'success');
          this.isAdmin.set(false);
          this.activeTab.set('chat');
          this.loadMembers();
        },
        error: (err) => this._utils.showToast(err.error?.message || 'Erreur lors du transfert.', 'error')
      });
    });
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
        },
      });
  }

  removeMember(userId: number, memberName: string) {
    this._utils.openConfirm('Retirer le membre', `Voulez-vous retirer ${memberName} du groupe ?`, () => {
      this._groupService.removeMemberFromGroup(this.groupId, userId).subscribe({
        next: () => {
          this._utils.showToast(`${memberName} a été retiré(e).`, 'success');
          this.loadMembers();
        },
        error: () => this._utils.showToast('Impossible de retirer ce membre.', 'error')
      });
    });
  }

  loadMySecretSantaTarget() {
    this._groupService.getMySecretSantaTarget(this.groupId).subscribe({
      next: (state) => this.secretSantaState.set(state),
      error: (err) => console.error('Erreur chargement état Secret Santa', err),
    });
  }

  triggerSecretSanta() {
    if (this.members().length < 3) {
      this._utils.showToast('Il faut au moins 3 membres pour lancer un tirage.', 'error');
      return;
    }
    this._utils.openConfirm('Lancer le tirage', 'Lancer le tirage de cette année ?', () => {
      this._groupService.drawSecretSanta(this.groupId).subscribe({
        next: () => {
          this._utils.showToast('Tirage effectué !', 'success');
          this.loadMySecretSantaTarget();
        },
        error: (err) => this._utils.showToast(err.error || 'Erreur lors du tirage.', 'error')
      });
    });
  }

  revealTarget() {
    this._groupService.revealSecretSanta(this.groupId).subscribe({
      next: (targetInfo) => {
        this.secretSantaState.set({ isDrawn: true, isRevealed: true, ...targetInfo });
      },
      error: (err) => this._utils.showToast('Impossible de révéler la cible pour le moment.', 'error')
    });
  }

  resetSecretSanta() {
    this._utils.openConfirm('Annuler le tirage', 'Voulez-vous vraiment annuler le tirage actuel ?', () => {
      this._groupService.resetSecretSanta(this.groupId).subscribe({
        next: () => {
          this._utils.showToast('Tirage réinitialisé.', 'success');
          this.loadMySecretSantaTarget();
        },
        error: () => this._utils.showToast('Erreur lors de la réinitialisation.', 'error')
      });
    });
  }
}