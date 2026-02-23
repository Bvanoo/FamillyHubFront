import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { GroupService } from '../Services/group-service';
import { SignalRService } from '../Services/signal-r';
import { AuthService } from '../Services/auth-service';
import { Navigation } from '../Services/navigation';

@Component({
  selector: 'app-group-details',
  imports: [CommonModule, FormsModule],
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

  /**
   * Initializes the group details view when it is first loaded. Sets up the current user context,
   * resolves the active group, and prepares chat and member data for interaction.
   */
  ngOnInit() {
    this.currentUser = this._authService.getUser();
    this.groupId = Number(this._route.snapshot.paramMap.get('id'));

    this.initChat();
    this.loadMembers();
  }

  /**
   * Sets up the real-time chat channel for the current group so members can see history and new messages.
   * Loads past messages, joins the SignalR group, and wires live updates into the local message list.
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

  /**
   * Loads the list of members for the current group and updates the local member state. Also determines
   * whether the current user has admin rights in the group based on their membership role.
   */
  loadMembers() {
    this._groupService.getGroupMembers(this.groupId).subscribe({
      next: (membres) => {
        this.members.set(membres);
        const myProfile = membres.find((m) => m.userId === this.currentUser.id);
        if (myProfile && myProfile.role === 'Admin') {
          this.isAdmin.set(true);
        }
      },
      error: (err) => console.error('Erreur chargement membres:', err),
    });
  }

  /**
   * Cleans up the group details view when it is destroyed. Ensures the user leaves the SignalR
   * group so no further real-time messages are received for this group.
   */
  ngOnDestroy() {
    this._signalRService.leaveGroup(this.groupId);
  }

  /**
   * Sends a new chat message to the current group on behalf of the logged-in user. Ignores empty
   * or whitespace-only messages and clears the input once the message is dispatched.
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
   * Permanently deletes the current group after user confirmation. Notifies the user of the outcome
   * and redirects back to the groups overview once the deletion succeeds.
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
   * Transfers the admin role of the current group to another member after explicit user confirmation.
   * Updates local admin state, refreshes the members list, and returns the view to the chat tab once the transfer succeeds.
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
}
