import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private hubConnection!: signalR.HubConnection;

  public startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7075/chatHub')
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('✅ Connecté au ChatHub SignalR'))
      .catch(err => console.log('❌ Erreur SignalR : ' + err));
  }

  public joinGroup(groupId: number) {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke("JoinGroupHub", groupId.toString())
        .catch(err => console.error("Erreur JoinGroup:", err));
    }
  }

  public leaveGroup(groupId: number) {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke("LeaveGroupHub", groupId.toString())
        .catch(err => console.error("Erreur LeaveGroup:", err));
    }
  }

  public sendMessageToGroup(groupId: number, message: string, senderId: string, senderName: string) {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.invoke("SendMessageToGroup", groupId.toString(), message, senderId, senderName)
        .catch(err => console.error("Erreur SendMessage:", err));
    }
  }

  public addMessageListener(callback: (senderName: string, message: string, timestamp: string) => void) {
    this.hubConnection.off("ReceiveMessage"); 
    this.hubConnection.on("ReceiveMessage", callback);
  }
}