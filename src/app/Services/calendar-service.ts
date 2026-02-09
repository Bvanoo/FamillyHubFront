import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private apiUrl = 'https://localhost:7075/api/calendar';

  constructor(private http: HttpClient) {}

  saveEvent(eventData: any) {
    return this.http.post(this.apiUrl, eventData);
  }

  getEvents(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }

  updateEvent(id: number, eventData: any): Observable<any> {
  return this.http.put(`${this.apiUrl}/${id}`, eventData);
}

deleteEvent(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/${id}`);
}
}
