import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({ providedIn: 'root' })
/**
 * Wraps a SignalR hub connection to provide real-time group chat capabilities.
 * Manages connecting to the hub, joining/leaving groups, sending messages, and subscribing to incoming messages.
 */
export class SignalRService {
  private _hubConnection!: signalR.HubConnection;

  /**
   * Initializes and starts the SignalR hub connection to the chat endpoint.
   * Logs a message to the console indicating whether the connection attempt succeeded or failed.
   */
  public startConnection(): Promise<void> {
    this._hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://famillyhub.azurewebsites.net/chatHub')
      .build();

    return this._hubConnection
      .start()
  }

  /**
   * Joins the SignalR group associated with the given group identifier.
   * Only attempts the join when the hub connection is currently established.
   *
   * Args:
   *   groupId: The identifier of the group to join for receiving its messages.
   */
  public joinGroup(groupId: number) {
    if (this._hubConnection?.state === signalR.HubConnectionState.Connected) {
      this._hubConnection
        .invoke('JoinGroupHub', groupId.toString())
        .catch((err) => console.error('Erreur JoinGroup:', err));
    }
  }

  /**
   * Leaves the SignalR group associated with the given group identifier.
   * Ensures the hub connection is active before invoking the server-side leave method.
   *
   * Args:
   *   groupId: The identifier of the group to leave.
   */
  public leaveGroup(groupId: number) {
    if (this._hubConnection?.state === signalR.HubConnectionState.Connected) {
      this._hubConnection
        .invoke('LeaveGroupHub', groupId.toString())
        .catch((err) => console.error('Erreur LeaveGroup:', err));
    }
  }

  /**
   * Sends a chat message to the specified group via the SignalR hub.
   * Includes the sender's identity information so recipients can see who sent the message.
   *
   * Args:
   *   groupId: The identifier of the group receiving the message.
   *   message: The text content of the message to send.
   *   senderId: The unique identifier of the user sending the message.
   *   senderName: The display name of the user sending the message.
   */
  public sendMessageToGroup(
    groupId: number,
    message: string,
    senderId: string,
    senderName: string,
  ) {
    if (this._hubConnection?.state === signalR.HubConnectionState.Connected) {
      this._hubConnection
        .invoke(
          'SendMessageToGroup',
          groupId.toString(),
          message,
          senderId,
          senderName,
        )
        .catch((err) => console.error('Erreur SendMessage:', err));
    }
  }

  /**
   * Registers a callback to be invoked whenever a new message is received from the hub.
   * Removes any previous "ReceiveMessage" handler to avoid duplicate invocations before attaching the new one.
   *
   * Args:
   *   callback: The function to call with sender name, message content, and timestamp for each incoming message.
   */
  public addMessageListener(
    callback: (senderName: string, message: string, timestamp: string) => void,
  ) {
    this._hubConnection.off('ReceiveMessage');
    this._hubConnection.on('ReceiveMessage', callback);
  }
}
