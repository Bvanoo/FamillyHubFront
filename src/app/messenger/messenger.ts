// import { Component, OnInit, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { SignalRService } from '../Services/signal-r';
// import { HttpClient } from '@angular/common/http';


// @Component({
//   selector: 'app-messenger',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './messenger.html',
//   styleUrl: './messenger.css',
// })
// export class Messenger implements OnInit {
//   currentUserId: number = 1; 
//   currentConversationId: number = 1;
//   messages = signal<any[]>([]);
//   newMessageContent: string = '';

//   constructor(
//     private readonly signalRService: SignalRService,
//     private readonly http: HttpClient
//   ) {}

// ngOnInit() {
//     this.chargerHistorique();
//     this.signalRService.startConnection();
//     this.signalRService.addMessageListener((senderName, content, timestamp) => {
//       if(!content) return;
      
//       const nouveauMsg = {
//         senderName: senderName,
//         content: content,
//         timestamp: timestamp,
//         isMe: senderName === this.currentUser?.name 
//       };
//       this.messages.update(prevMessages => [...prevMessages, nouveauMsg]);
//     });
//   }

//   chargerHistorique() {
//     const url = `https://localhost:7075/api/messages/${this.currentConversationId}`;
//     this.http.get<any[]>(url).subscribe({
//       next: (data) => {
//         const history = data.map(m => ({
//           ...m,
//           isMe: m.senderId === this.currentUserId
//         }));
//         this.messages.set(history);
//       },
//       error: (err) => console.error("Erreur historique:", err)
//     });
//   }
//   envoyerMessage() {
//     if (this.newMessageContent.trim() !== '') {
//       this.signalrService.sendMessage(
//         this.currentConversationId, 
//         this.currentUserId, 
//         this.newMessageContent
//       );
//       this.newMessageContent = ''; // Reset l'input
//     }
//   }
// }