import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Group } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class GroupService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7075/api/group';
  
  getMyGroups(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/my-groups/${userId}`);
  }

  createGroup(group: any): Observable<Group> {
    return this.http.post<Group>(this.apiUrl, group);
  }

  searchGroups(query: string): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.apiUrl}/search?query=${query}`);
  }

  joinGroup(groupId: number, userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${groupId}/invite/${userId}`, {});
  }
}