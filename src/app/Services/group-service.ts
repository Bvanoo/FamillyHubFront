import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GroupService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7075/api/Group';

  createGroup(data: { name: string, description?: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, data);
  }

  joinByCode(code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/join/code`, JSON.stringify(code), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  requestJoin(groupId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/join/request/${groupId}`, {});
  }

  getMyGroups(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-groups`);
  }

  getGroupMessages(groupId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${groupId}/messages`);
  }
  getGroupMembers(groupId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${groupId}/members`);
  }

  deleteGroup(groupId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${groupId}`);
  }

  transferAdmin(groupId: number, newOwnerId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${groupId}/transfer/${newOwnerId}`, {});
  }
}