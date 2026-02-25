import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CalendarEvent } from '../models/interfaces';
import { Navigation } from './navigation';

@Injectable({
  providedIn: 'root',
})

/**
 * Encapsulates all calendar-related API operations for events and their associated expenses.
 * Provides methods to create, read, update, delete, and augment events so components can interact with the backend through a single service.
 */
export class CalendarService {
  private readonly _http = inject(HttpClient);
  private readonly _nav = inject(Navigation);
  baseUrl = this._nav.baseUrlProd;
  private readonly _apiUrl = this.baseUrl+'/api/calendar';
  private readonly _expenseUrl = this.baseUrl+'/api/expense';
  /**
   * Persists a new calendar event to the backend.
   *
   * Args:
   *   eventData: The event details to be created on the server.
   *
   * Returns:
   *   An observable emitting the creation result or created event.
   */
  saveEvent(eventData: CalendarEvent): Observable<any> {
    return this._http.post(this._apiUrl, eventData);
  }

  /**
   * Retrieves all events associated with a specific user.
   *
   * Args:
   *   userId: The identifier of the user whose events are requested.
   *
   * Returns:
   *   An observable emitting the list of that user's calendar events.
   */
  getUserEvents(userId: number): Observable<CalendarEvent[]> {
    return this._http.get<CalendarEvent[]>(`${this._apiUrl}/user/${userId}`);
  }

  /**
   * Fetches a unified list of events that may combine personal and group calendar data.
   *
   * Returns:
   *   An observable emitting the unified collection of calendar events.
   */
  getUnifiedEvents(): Observable<CalendarEvent[]> {
    return this._http.get<CalendarEvent[]>(`${this._apiUrl}/unified`);
  }

  /**
   * Updates an existing calendar event with new data.
   *
   * Args:
   *   id: The identifier of the event to update.
   *   eventData: The updated event properties to apply on the server.
   *
   * Returns:
   *   An observable emitting the update result.
   */
  updateEvent(id: number, eventData: CalendarEvent): Observable<any> {
    return this._http.put(`${this._apiUrl}/${id}`, eventData);
  }

  /**
   * Deletes a calendar event by its identifier.
   *
   * Args:
   *   id: The identifier of the event to delete.
   *
   * Returns:
   *   An observable emitting the deletion result.
   */
  deleteEvent(id: number): Observable<any> {
    return this._http.delete(`${this._apiUrl}/${id}`);
  }

  /**
   * Retrieves the expense balance associated with a specific event.
   *
   * Args:
   *   eventId: The identifier of the event whose balance is requested.
   *
   * Returns:
   *   An observable emitting the computed balance information.
   */
  getBalance(eventId: number): Observable<any> {
    return this._http.get(`${this._expenseUrl}/balance/${eventId}`);
  }
  
  /**
   * Fetches events for a specific group, including participants' personal blocked times.
   */
  getGroupEvents(groupId: number): Observable<CalendarEvent[]> {
    return this._http.get<CalendarEvent[]>(`${this._apiUrl}/group/${groupId}`);
  }
}
