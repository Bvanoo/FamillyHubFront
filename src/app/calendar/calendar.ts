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
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.css']
})
export class Calendar implements OnInit {
  private _calendarService = inject(CalendarService);
  private _groupService = inject(GroupService);
  private cdr = inject(ChangeDetectorRef);

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
  userId: this.userId
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
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    select: this.handleSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    events: []
  };

  ngOnInit() {
    this.loadUnifiedEvents();
    this.loadMyGroups();
  }

  loadUnifiedEvents() {
    this._calendarService.getUnifiedEvents().subscribe({
      next: (events) => {
        const mappedEvents = events.map((e: any) => ({
        }));
        this.calendarOptions = { ...this.calendarOptions, events: mappedEvents };
        this.cdr.detectChanges();
      }
    });
  }

  loadMyGroups() {
    this._groupService.getMyGroups(this.userId).subscribe(groups => this.myGroups = groups);
  }

handleSelect(selectInfo: DateSelectArg) {
    this.isEditMode = false;
    this.resetTempEvent(); 
    this.tempEvent.start = selectInfo.startStr;
    this.tempEvent.end = selectInfo.endStr;
    this.openModal();
    selectInfo.view.calendar.unselect();
  }

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
    groupId: props['groupId']
  };
  this.openModal();
}

saveEvent() {
    if (!this.tempEvent.start || !this.tempEvent.end) {
      alert("Veuillez sélectionner une plage horaire valide.");
      return;
    }
    const safeTitle = this.tempEvent.title || this.tempEvent.type || 'Sans titre';

    const payload: CalendarEvent = {
      ...this.tempEvent,
      userId: this.userId,
      title: safeTitle,
      color: this.tempEvent.groupId ? '#3b82f6' : this.tempEvent.color 
    };

    console.log("Envoi payload:", payload);

    const request = this.isEditMode && this.selectedEventId
      ? this._calendarService.updateEvent(this.selectedEventId, payload)
      : this._calendarService.saveEvent(payload);

    request.subscribe({
      next: () => {
        this.loadUnifiedEvents();
        this.closeModal();
      },
      error: (err) => {
        console.error("Erreur lors de la sauvegarde", err);
        if (err.error && err.error.errors) {
            console.log("Détails validation:", err.error.errors);
        }
      }
    });
  }

deleteEvent() {
    if (this.selectedEventId) {
      this._calendarService.deleteEvent(this.selectedEventId).subscribe(() => {
        this.loadUnifiedEvents();
        this.closeModal();
      });
    }
  }

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
      userId: this.userId
    };
  }

  openModal() {
    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeModal() {
    this.showModal = false;
    this.cdr.detectChanges();
  }

  saveToDatabase() {
    console.log("Sauvegarde globale (déjà gérée par l'API unitaire ici)");
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    this.closeModal();
  }
}