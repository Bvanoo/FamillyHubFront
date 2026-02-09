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

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.css']
})
export class Calendar implements OnInit {
  private _calendarService = inject(CalendarService);
  private cdr = inject(ChangeDetectorRef);

  // State
  showModal = false;
  isEditMode = false;
  userId = 1;
  selectedEventId: number | null = null;

  tempEvent = {
    title: '',
    color: '#117ebd',
    type: 'Disponible',
    start: '',
    end: ''
  };

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    locale: frLocale,
    slotDuration: '02:00:00',
    allDaySlot: false,
    selectable: true,
    height: 'auto',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,timeGridDay'
    },
    select: this.handleSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventContent: this.renderEventContent.bind(this),
    events: []
  };

  ngOnInit() {
    this.loadUserEvents();
  }

  loadUserEvents() {
    this._calendarService.getEvents(this.userId).subscribe({
      next: (events) => {
        this.calendarOptions = { ...this.calendarOptions, events };
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Échec du chargement des événements", err)
    });
  }

  handleSelect(selectInfo: DateSelectArg) {
    this.isEditMode = false;
    this.tempEvent = {
      title: '',
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      color: '#117ebd',
      type: 'Disponible'
    };
    this.openModal();
    selectInfo.view.calendar.unselect();
  }

  handleEventClick(clickInfo: EventClickArg) {
    this.isEditMode = true;
    this.selectedEventId = Number(clickInfo.event.id);
    this.tempEvent = {
      title: clickInfo.event.title,
      start: clickInfo.event.startStr,
      end: clickInfo.event.endStr,
      color: clickInfo.event.backgroundColor || '#117ebd',
      type: clickInfo.event.extendedProps?.['type'] || 'Disponible'
    };
    this.openModal();
  }

  saveEvent() {
    const payload = {
      ...this.tempEvent,
      userId: this.userId,
      title: this.tempEvent.title || this.tempEvent.type
    };

    const request = this.isEditMode && this.selectedEventId
      ? this._calendarService.updateEvent(this.selectedEventId, payload)
      : this._calendarService.saveEvent(payload);

    request.subscribe({
      next: () => {
        this.loadUserEvents();
        this.closeModal();
      },
      error: (err) => console.error("Erreur lors de la sauvegarde", err)
    });
  }

  deleteEvent() {
    if (!this.selectedEventId) return;
    this._calendarService.deleteEvent(this.selectedEventId).subscribe({
      next: () => {
        this.loadUserEvents();
        this.closeModal();
      },
      error: (err) => {
        console.warn("L'événement n'existe plus ou erreur serveur", err);
        this.closeModal();
      }
    });
  }

  saveToDatabase() {
      console.log("Sauvegarde globale déclenchée");
  }

  // UI Helpers
  openModal() {
    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeModal() {
    this.showModal = false;
    this.cdr.detectChanges();
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    this.closeModal();
  }

  renderEventContent(eventInfo: any) {
    const firstName = eventInfo.event.extendedProps.firstName || 'Moi';
    const photoUrl = eventInfo.event.extendedProps.photoUrl || 'assets/default-avatar.png';
    
    return {
      html: `
        <div class="fc-event-custom">
          <img src="${photoUrl}" class="event-user-img">
          <div class="event-info">
            <b style="font-size: 0.75rem">${firstName}</b>
            <div style="font-size: 0.7rem; opacity: 0.8">${eventInfo.event.title}</div>
          </div>
        </div>
      `
    };
  }
}