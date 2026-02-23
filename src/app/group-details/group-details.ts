import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupService } from '../Services/group-service';
import { SignalRService } from '../Services/signal-r';
import { AuthService } from '../Services/auth-service';

@Component({
  selector: 'app-group-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './group-details.html',
  styleUrls: ['./group-details.css']
})
export class GroupDetails implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private groupService = inject(GroupService);
  private signalRService = inject(SignalRService);
  private authService = inject(AuthService);

  groupId!: number;
  currentUser: any;
  activeTab = signal<string>('chat');
  messages = signal<any[]>([]);
  members = signal<any[]>([]);
  isAdmin = signal<boolean>(false);
  
  newMessage: string = '';

  ngOnInit() {
    this.currentUser = this.authService.getUser();
    this.groupId = Number(this.route.snapshot.paramMap.get('id'));

    this.initChat();
    this.loadMembers();
  }

  initChat() {
    this.signalRService.startConnection();
    this.signalRService.joinGroup(this.groupId);

    this.groupService.getGroupMessages(this.groupId).subscribe({
      next: (history) => this.messages.set(history),
      error: (err) => console.error("Erreur historique:", err)
    });

    this.signalRService.addMessageListener((senderName, content, timestamp) => {
      this.messages.update(prev => [...prev, { senderName, content, timestamp }]);
    });
  }

  loadMembers() {
    this.groupService.getGroupMembers(this.groupId).subscribe({
      next: (membres) => {
        this.members.set(membres);
        const myProfile = membres.find(m => m.userId === this.currentUser.id);
        if (myProfile && myProfile.role === 'Admin') {
          this.isAdmin.set(true);
        }
      },
      error: (err) => console.error("Erreur chargement membres:", err)
    });
  }

  ngOnDestroy() {
    this.signalRService.leaveGroup(this.groupId);
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;
    this.signalRService.sendMessageToGroup(
      this.groupId, this.newMessage, this.currentUser.id.toString(), this.currentUser.name
    );
    this.newMessage = '';
  }
  
  goBack() {
    this.router.navigate(['/groupes']);
  }

  deleteGroup() {
    if (confirm("Êtes-vous sûr de vouloir supprimer définitivement ce groupe ? Cette action est irréversible.")) {
      this.groupService.deleteGroup(this.groupId).subscribe({
        next: () => {
          alert("Groupe supprimé.");
          this.router.navigate(['/groupes']);
        },
        error: (err) => alert(err.error?.message || "Erreur lors de la suppression.")
      });
    }
  }

  transferRole(newAdminId: number, memberName: string) {
    if (confirm(`Voulez-vous transférer vos droits d'Admin à ${memberName} ? Vous deviendrez un membre normal.`)) {
      this.groupService.transferAdmin(this.groupId, newAdminId).subscribe({
        next: () => {
          alert(`Les droits ont été transférés à ${memberName}.`);
          this.isAdmin.set(false);
          this.activeTab.set('chat');
          this.loadMembers();
        },
        error: (err) => alert(err.error?.message || "Erreur lors du transfert.")
      });
    }
  }
}