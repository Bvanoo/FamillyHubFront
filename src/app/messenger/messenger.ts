import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SignalrService } from '../Services/signal-r';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-messenger',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messenger.html',
  styleUrl: './messenger.css',
})
export class Messenger implements OnInit {
  currentUserId: number = 1; 
  currentConversationId: number = 1;
  messages = signal<any[]>([]);
  newMessageContent: string = '';

  constructor(
    private signalrService: SignalrService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.chargerHistorique();
    this.signalrService.startConnection().then(() => {
      this.signalrService.joinConversation(this.currentConversationId);
    });
    this.signalrService.messageReceived$.subscribe((msg) => {
      if(!msg) return;
      const nouveauMsg = ({
        ...msg,
        isMe: msg.senderId === this.currentUserId
      });
      this.messages.update(prevMessages => [...prevMessages, nouveauMsg]);
    });
  }

  chargerHistorique() {
    const url = `https://localhost:7075/api/messages/${this.currentConversationId}`;
    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        const history = data.map(m => ({
          ...m,
          isMe: m.senderId === this.currentUserId
        }));
        this.messages.set(history);
      },
      error: (err) => console.error("Erreur historique:", err)
    });
  }
  envoyerMessage() {
    if (this.newMessageContent.trim() !== '') {
      this.signalrService.sendMessage(
        this.currentConversationId, 
        this.currentUserId, 
        this.newMessageContent
      );
      this.newMessageContent = ''; // Reset l'input
    }
  }
}