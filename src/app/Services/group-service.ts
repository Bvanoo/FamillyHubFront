import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
/**
 * Centralizes all backend interactions related to user groups and their membership.
 * Exposes operations for creating, joining, managing, and querying groups, members, and group messages.
 */
export class GroupService {
  private readonly _http = inject(HttpClient);
  private readonly _apiUrl = 'https://localhost:7075/api/Group';

  /**
   * Creates a new group with the provided metadata.
   *
   * Args:
   *   data: Basic details of the group, including its name and optional description.
   *
   * Returns:
   *   An observable emitting the server's response with group information.
   */
  createGroup(data: { name: string; description?: string }): Observable<any> {
    return this._http.post(`${this._apiUrl}/create`, data);
  }

  /**
   * Attempts to join a group using an invite or access code.
   *
   * Args:
   *   code: The code identifying the group to join.
   *
   * Returns:
   *   An observable emitting the result of the join attempt.
   */
  joinByCode(code: string): Observable<any> {
    return this._http.post(`${this._apiUrl}/join/code`, JSON.stringify(code), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Sends a join request for a specific group, typically pending admin approval.
   *
   * Args:
   *   groupId: The identifier of the group to request membership in.
   *
   * Returns:
   *   An observable emitting the server's acknowledgement of the request.
   */
  requestJoin(groupId: number): Observable<any> {
    return this._http.post(`${this._apiUrl}/join/request/${groupId}`, {});
  }

  /**
   * Retrieves the list of groups the current user belongs to.
   *
   * Returns:
   *   An observable emitting an array of groups associated with the user.
   */
  getMyGroups(): Observable<any[]> {
    return this._http.get<any[]>(`${this._apiUrl}/my-groups`);
  }

  /**
   * Fetches the message history for a given group.
   *
   * Args:
   *   groupId: The identifier of the group whose messages are requested.
   *
   * Returns:
   *   An observable emitting an array of group messages.
   */
  getGroupMessages(groupId: number): Observable<any[]> {
    return this._http.get<any[]>(`${this._apiUrl}/${groupId}/messages`);
  }
  /**
   * Retrieves the members associated with a specific group.
   *
   * Args:
   *   groupId: The identifier of the group whose members should be returned.
   *
   * Returns:
   *   An observable emitting an array of group member records.
   */
  getGroupMembers(groupId: number): Observable<any[]> {
    return this._http.get<any[]>(`${this._apiUrl}/${groupId}/members`);
  }
  /**
   * Permanently deletes a group identified by its ID.
   *
   * Args:
   *   groupId: The identifier of the group to delete.
   *
   * Returns:
   *   An observable emitting the deletion result from the server.
   */
  deleteGroup(groupId: number): Observable<any> {
    return this._http.delete(`${this._apiUrl}/${groupId}`);
  }
  /**
   * Transfers administrative ownership of a group from the current admin to another member.
   *
   * Args:
   *   groupId: The identifier of the group whose admin is being changed.
   *   newOwnerId: The identifier of the member who will become the new admin.
   *
   * Returns:
   *   An observable emitting the server's response to the transfer operation.
   */
  transferAdmin(groupId: number, newOwnerId: number): Observable<any> {
    return this._http.post(
      `${this._apiUrl}/${groupId}/transfer/${newOwnerId}`,
      {},
    );
  }
  /**
   * Recherche des utilisateurs par nom ou email qui ne sont pas encore dans le groupe.
   */
  searchUsersNotInGroup(groupId: number, query: string): Observable<any[]> {
    return this._http.get<any[]>(`${this._apiUrl}/${groupId}/search-users?query=${query}`);
  }

  /**
   * Envoie une invitation à un utilisateur pour rejoindre un groupe spécifique.
   */
  inviteUserToGroup(groupId: number, userId: number): Observable<any> {
    return this._http.post(`${this._apiUrl}/${groupId}/invite/${userId}`, {});
  }
  /**
   * Récupère les détails d'un groupe spécifique via son ID.
   */
  getGroupById(groupId: number): Observable<any> {
    return this._http.get<any>(`${this._apiUrl}/${groupId}`);
  }
  /**
   * Retire un membre spécifique d'un groupe.
   */
  removeMemberFromGroup(groupId: number, userId: number): Observable<any> {
    return this._http.delete(`${this._apiUrl}/${groupId}/members/${userId}`);
  }
}
