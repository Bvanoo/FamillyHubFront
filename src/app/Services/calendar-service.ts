import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CalendarEvent } from '../models/interfaces';

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:7075/api/calendar';
  private expenseUrl = 'https://localhost:7075/api/expense';

  saveEvent(eventData: CalendarEvent): Observable<any> {
    return this.http.post(this.apiUrl, eventData);
  }

  getUserEvents(userId: number): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(`${this.apiUrl}/user/${userId}`);
  }

  getUnifiedEvents(): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(`${this.apiUrl}/unified`);
  }

  updateEvent(id: number, eventData: CalendarEvent): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, eventData);
  }

  deleteEvent(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getBalance(eventId: number): Observable<any> {
    return this.http.get(`${this.expenseUrl}/balance/${eventId}`);
  }
}