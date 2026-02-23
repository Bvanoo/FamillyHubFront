import { Component, inject, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, DateSelectArg, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { CalendarService } from '../Services/calendar-service';
import { GroupService } from '../Services/group-service';
import { CalendarEvent } from '../models/interfaces';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, FormsModule, FullCalendarModule],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.css'],
})
/**
 * Represents the main calendar view used to display, create, and manage user and group events.
 * Coordinates data loading, user interactions, and modal state for editing and viewing calendar entries.
 */
export class Calendar implements OnInit {
  private readonly _calendarService = inject(CalendarService);
  private readonly _groupService = inject(GroupService);
  private readonly _cdr = inject(ChangeDetectorRef);

  showModal = false;
  isEditMode = false;
  userId = 1;
  selectedEventId: number | null = null;
  myGroups: any[] = [];
  tempEvent = {
    title: '',
    description: '',
    start: '',
    end: '',
    color: '#3b82f6',
    type: 'Disponible',
    isPrivate: false,
    maskDetails: false,
    groupId: null,
    userId: this.userId,
  };

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    locale: frLocale,
    slotDuration: '01:00:00',
    selectable: true,
    height: 'auto',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    select: this.handleSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    events: [],
  };
  /**
   * Initializes the calendar component when it is first displayed. Prepares the view with the
   * current set of events and the groups associated with the user so interactions are meaningful.
   */
  ngOnInit() {
    this.loadUnifiedEvents();
    this.loadMyGroups();
  }
  /**
   * Refreshes the calendar with the unified set of events from the backend. Keeps the visible
   * calendar in sync with the latest user and group event data.
   */
  loadUnifiedEvents() {
    this._calendarService.getUnifiedEvents().subscribe({
      next: (events) => {
        const mappedEvents = events.map((e: any) => ({}));
        this.calendarOptions = {
          ...this.calendarOptions,
          events: mappedEvents,
        };
        this._cdr.detectChanges();
      },
    });
  }
  /**
   * Retrieves the groups associated with the current user and stores them for use in the calendar.
   * Ensures group-related options and filtering in the calendar reflect the user's actual memberships.
   */
  loadMyGroups() {
    this._groupService
      .getMyGroups()
      .subscribe((groups) => (this.myGroups = groups));
  }
  /**
   * Handles the user selecting a time range on the calendar to create a new event. Prepares a
   * fresh temporary event and opens the event editor for the chosen time slot.
   */
  handleSelect(selectInfo: DateSelectArg) {
    this.isEditMode = false;
    this.resetTempEvent();
    this.tempEvent.start = selectInfo.startStr;
    this.tempEvent.end = selectInfo.endStr;
    this.openModal();
    selectInfo.view.calendar.unselect();
  }
  /**
   * Handles a user clicking on an existing event in the calendar to view or edit its details.
   * Switches the component into edit mode and pre-fills the temporary event with the clicked event's data.
   */
  handleEventClick(clickInfo: EventClickArg) {
    this.isEditMode = true;
    const props = clickInfo.event.extendedProps;
    this.selectedEventId = Number(clickInfo.event.id);

    this.tempEvent = {
      userId: this.userId,
      title: clickInfo.event.title,
      description: props['description'] || '',
      start: clickInfo.event.startStr,
      end: clickInfo.event.endStr,
      color: clickInfo.event.backgroundColor,
      type: props['type'],
      isPrivate: props['isPrivate'],
      maskDetails: props['maskDetails'],
      groupId: props['groupId'],
    };
    this.openModal();
  }
  /**
   * Saves the current temporary event to the backend, either creating a new entry or updating an existing one.
   * Validates the selected time range and then refreshes the calendar view and closes the modal once the save completes.
   */
  saveEvent() {
    if (!this.tempEvent.start || !this.tempEvent.end) {
      alert('Veuillez sélectionner une plage horaire valide.');
      return;
    }
    const safeTitle =
      this.tempEvent.title || this.tempEvent.type || 'Sans titre';

    const payload: CalendarEvent = {
      ...this.tempEvent,
      userId: this.userId,
      title: safeTitle,
      color: this.tempEvent.groupId ? '#3b82f6' : this.tempEvent.color,
    };

    console.log('Envoi payload:', payload);

    const request =
      this.isEditMode && this.selectedEventId
        ? this._calendarService.updateEvent(this.selectedEventId, payload)
        : this._calendarService.saveEvent(payload);

    request.subscribe({
      next: () => {
        this.loadUnifiedEvents();
        this.closeModal();
      },
      error: (err) => {
        console.error('Erreur lors de la sauvegarde', err);
        if (err.error && err.error.errors) {
          console.log('Détails validation:', err.error.errors);
        }
      },
    });
  }
  /**
   * Deletes the currently selected event from the calendar. After removal, it refreshes the
   * displayed events and closes the modal to reflect the updated calendar state.
   */
  deleteEvent() {
    if (this.selectedEventId) {
      this._calendarService.deleteEvent(this.selectedEventId).subscribe(() => {
        this.loadUnifiedEvents();
        this.closeModal();
      });
    }
  }
  /**
   * Deletes the currently selected event from the backend calendar data. After deletion, it
   * refreshes the displayed events and closes the event modal to reflect the updated state.
   */
  resetTempEvent() {
    this.tempEvent = {
      title: '',
      description: '',
      start: '',
      end: '',
      color: '#3b82f6',
      type: 'Disponible',
      isPrivate: false,
      maskDetails: false,
      groupId: null,
      userId: this.userId,
    };
  }
  /**
   * Opens the event modal so the user can create or edit a calendar entry. Ensures the view updates
   * immediately to reflect the modal's visible state.
   */
  openModal() {
    this.showModal = true;
    this._cdr.detectChanges();
  }
  /**
   * Closes the event modal when the user finishes or cancels editing. Triggers a view update so
   * the hidden modal state is immediately reflected in the UI.
   */
  closeModal() {
    this.showModal = false;
    this._cdr.detectChanges();
  }
  /**
   * Placeholder hook for triggering a global save of calendar data. Currently logs a message
   * indicating that persistence is already handled by the per-event API operations.
   */
  saveToDatabase() {
    console.log("Sauvegarde globale (déjà gérée par l'API unitaire ici)");
  }
  /**
   * Handles the Escape key press at the document level to provide a quick way to dismiss the modal.
   * When triggered, it closes any open event modal so the user can return to the calendar view.
   */
  @HostListener('document:keydown.escape')
  onEsc() {
    this.closeModal();
  }
}
