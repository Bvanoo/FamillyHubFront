import {
  Component,
  inject,
  OnInit,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import {
  CalendarOptions,
  DateSelectArg,
  EventClickArg,
} from '@fullcalendar/core';
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
  styleUrls: ['./calendar.css'],
})
export class Calendar implements OnInit {
  private readonly _calendarService = inject(CalendarService);
  private readonly cdr = inject(ChangeDetectorRef);

  showModal = false;
  isEditMode = false;
  userId = 1;
  selectedEventId: number | null = null;
  selectedStartTime: string = '08:00';
  selectedEndTime: string = '10:00';

  tempEvent = {
    title: '',
    color: '#117ebd',
    type: 'Disponible',
    start: '',
    end: '',
  };

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    locale: frLocale,
    slotDuration: '00:30:00',
    allDaySlot: false,
    selectable: true,
    height: 'auto',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,timeGridDay',
    },
    select: this.handleSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventContent: this.renderEventContent.bind(this),
    events: [],
  };

  ngOnInit() {
    this.generateTimeSlots();
    this.loadUserEvents();
  }

  loadUserEvents() {
    this._calendarService.getEvents(this.userId).subscribe({
      next: (events) => {
        this.calendarOptions = { ...this.calendarOptions, events };
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Échec du chargement des événements', err),
    });
  }

  handleSelect(selectInfo: DateSelectArg) {
    this.isEditMode = false;
    this.selectedStartTime =
      selectInfo.startStr.split('T')[1]?.substring(0, 5) || '08:00';
    this.selectedEndTime =
      selectInfo.endStr.split('T')[1]?.substring(0, 5) || '10:00';
    this.tempEvent = {
      title: '',
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      color: '#117ebd',
      type: 'Disponible',
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
      type: clickInfo.event.extendedProps?.['type'] || 'Disponible',
    };
    this.openModal();
  }

  saveEvent() {
    if (!this.selectedStartTime || !this.selectedEndTime) {
      console.error('Heures non définies');
      return;
    }

    const datePart = this.tempEvent.start.includes('T')
      ? this.tempEvent.start.split('T')[0]
      : this.tempEvent.start;

    const payload = {
      ...this.tempEvent,
      userId: this.userId,
      title: this.tempEvent.title?.trim() || this.tempEvent.type,
      start: `${datePart}T${this.selectedStartTime}:00`,
      end: `${datePart}T${this.selectedEndTime}:00`,
    };
    console.log('Payload envoyé au serveur:', payload);

    const request =
      this.isEditMode && this.selectedEventId
        ? this._calendarService.updateEvent(this.selectedEventId, payload)
        : this._calendarService.saveEvent(payload);

    request.subscribe({
      next: () => {
        this.loadUserEvents();
        this.closeModal();
      },
      error: (err) => {
        console.error("Détail de l'erreur 400:", err.error);
      },
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
      },
    });
  }

  saveToDatabase() {
    console.log('Sauvegarde globale déclenchée');
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

  timeSlots: string[] = [];

  generateTimeSlots() {
    const slots = [];
    for (let i = 0; i < 24; i++) {
      const hour = i < 10 ? `0${i}` : `${i}`;
      slots.push(`${hour}:00`, `${hour}:30`);
    }
    this.timeSlots = slots;
  }
  handleDateSelect(selectInfo: any) {
    this.isEditMode = false;
    this.tempEvent.start = selectInfo.startStr;
    this.tempEvent.end = selectInfo.endStr;
    this.selectedStartTime =
      selectInfo.startStr.split('T')[1]?.substring(0, 5) || '08:00';
    this.selectedEndTime =
      selectInfo.endStr.split('T')[1]?.substring(0, 5) || '10:00';
    this.showModal = true;
    this.cdr.detectChanges();
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    this.closeModal();
  }

  renderEventContent(eventInfo: any) {
    const firstName = eventInfo.event.extendedProps.firstName || 'Moi';
    // const photoUrl = eventInfo.event.extendedProps.photoUrl || 'assets/default-avatar.png';

    return {
      // <img src="${photoUrl}" class="event-user-img">
      html: `
        <div class="fc-event-custom">
           
          <div class="event-info">
            <b style="font-size: 0.75rem">${firstName}</b>
            <div style="font-size: 0.7rem; opacity: 0.8">${eventInfo.event.title}</div>
          </div>
        </div>
      `,
    };
  }
  onStartTimeChange() {
    if (this.selectedStartTime >= this.selectedEndTime) {
      const startIndex = this.timeSlots.indexOf(this.selectedStartTime);
      const nextIndex = Math.min(startIndex + 1, this.timeSlots.length - 1);
      this.selectedEndTime = this.timeSlots[nextIndex];
    }
  }
  getAvailableEndSlots(): string[] {
    return this.timeSlots.filter((time) => time > this.selectedStartTime);
  }
}
