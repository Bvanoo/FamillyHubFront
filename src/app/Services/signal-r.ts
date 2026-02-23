import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SignalrService {
  public hubConnection!: signalR.HubConnection;
  private readonly messageReceivedSubject = new BehaviorSubject<{senderId: number, content: string, createdAt: Date} | null>(null);
  public messageReceived$ = this.messageReceivedSubject.asObservable();

  public async startConnection(): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7075/chatHub')
      .withAutomaticReconnect()
      .build();

    this.registerOnServerEvents();

    try {
      await this.hubConnection.start();
      console.log('Connexion SignalR établie avec succès !');
    } catch (err) {
      console.error('Erreur lors de la connexion SignalR :', err);
      throw err;
    }
  }

  private registerOnServerEvents(): void {
    this.hubConnection.on('ReceiveMessage', (senderId: number, content: string, createdAt: Date) => {
      this.messageReceivedSubject.next({ senderId, content, createdAt });
    });
  }

  public joinConversation(conversationId: number): void {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke('JoinConversation', conversationId)
        .catch(err => console.error('Erreur JoinConversation :', err));
    }
  }

  public sendMessage(conversationId: number, senderId: number, content: string): void {
    this.hubConnection.invoke('SendMessage', conversationId, senderId, content)
      .catch(err => console.error('Erreur SendMessage :', err));
  }
}
