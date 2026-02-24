import { Component, inject, OnInit, ChangeDetectorRef, HostListener, Input } from '@angular/core';
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
import { AuthService } from '../Services/auth-service';
import { CalendarEvent } from '../models/interfaces';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, FormsModule, FullCalendarModule],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.css'],
})
export class Calendar implements OnInit {
  @Input() groupId?: number;

  private readonly _calendarService = inject(CalendarService);
  private readonly _groupService = inject(GroupService);
  private readonly _authService = inject(AuthService);
  private readonly _cdr = inject(ChangeDetectorRef);

  showModal = false;
  isEditMode = false;
  userId: number = 0;
  selectedEventId: number | null = null;
  myGroups: any[] = [];

  tempEvent: any = {
    title: '',
    description: '',
    start: '',
    end: '',
    color: '#3b82f6',
    type: 'Disponible',
    isPrivate: false,
    maskDetails: false,
    groupId: null,
    userId: 0,
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
    eventContent: this.renderEventContent.bind(this),
    events: [],
  };

  ngOnInit() {
    const user = this._authService.getUser();
    if (user) {
      this.userId = user.id || user.Id;
      this.tempEvent.userId = this.userId;
    }

    this.loadUnifiedEvents();

    if (!this.groupId) {
      this.loadMyGroups();
    }
  }

  renderEventContent(arg: any) {
    const props = arg.event.extendedProps;
    const title = arg.event.title;
    const pic = props.userPicture;
    const name = props.userName || 'Utilisateur';

    let imgHtml = pic
      ? `<img src="${pic}" style="width: 18px; height: 18px; border-radius: 50%; object-fit: cover; margin-right: 5px; flex-shrink: 0;" onerror="this.style.display='none'">`
      : `<span style="margin-right: 5px; font-size: 14px;">👤</span>`;

    return {
      html: `<div title="${name} : ${title}" style="display: flex; align-items: center; overflow: hidden; padding: 2px;">
               ${imgHtml}
               <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.9em;">
                 <b>${name}</b> : ${title}
               </span>
             </div>`
    };
  }

loadUnifiedEvents() {
    // Choix de la requête selon si on est dans un groupe ou sur la bannière globale
    const request$ = this.groupId 
      ? this._calendarService.getGroupEvents(this.groupId) 
      : this._calendarService.getUnifiedEvents();

    request$.subscribe({
      next: (events: any[]) => {
        const mappedEvents = events.map((e: any) => {
          const isMyEvent = (e.userId || e.UserId) === this.userId;
          const isPrivate = e.isPrivate || e.IsPrivateEvent || e.IsPrivate;

          let bgColor = e.color || e.Color || '#3b82f6';
          let displayTitle = e.title || e.Title || 'Sans titre';

          // Ajout visuel d'un cadenas pour MES propres événements privés
          if (isMyEvent && isPrivate) {
            displayTitle = `🔒 ${displayTitle}`;
          }

          let picUrl = e.userPicture || e.UserPicture;
          if (picUrl && !picUrl.startsWith('http')) {
            picUrl = `https://localhost:7075${picUrl}`;
          }

          return {
            id: (e.id || e.Id)?.toString(),
            title: displayTitle,
            start: e.start || e.Start,
            end: e.end || e.End,
            backgroundColor: bgColor,
            borderColor: bgColor,
            extendedProps: {
              realTitle: e.title || e.Title || 'Sans titre',
              realDescription: e.description || e.Description || '',
              description: e.description || e.Description,
              groupId: e.groupId || e.GroupId,
              userId: e.userId || e.UserId,
              userName: e.userName || e.UserName || 'Utilisateur',
              userPicture: picUrl,
              isPrivate: isPrivate,
              maskDetails: e.maskDetails || e.MaskDetails,
              type: e.type || e.Type
            }
          };
        });

        this.calendarOptions = { ...this.calendarOptions, events: mappedEvents };
        this._cdr.detectChanges();
      },
      error: (err) => console.error('Erreur chargement événements:', err)
    });
  }

  loadMyGroups() {
    this._groupService.getMyGroups().subscribe({
      next: (groups) => (this.myGroups = groups),
      error: (err) => console.error('Erreur chargement groupes:', err)
    });
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
    const props = clickInfo.event.extendedProps;
    const eventOwnerId = props['userId'];
    const isPrivate = props['isPrivate'];

    if (eventOwnerId !== this.userId && isPrivate) {
      return;
    }

    this.isEditMode = true;
    this.selectedEventId = Number(clickInfo.event.id);

    this.tempEvent = {
      userId: eventOwnerId || this.userId,
      title: props['realTitle'],
      description: props['realDescription'],
      start: clickInfo.event.startStr,
      end: clickInfo.event.endStr,
      color: clickInfo.event.backgroundColor,
      type: props['type'] || 'Disponible',
      isPrivate: isPrivate || false,
      maskDetails: props['maskDetails'] || false,
      groupId: props['groupId'] || null,
    };
    this.openModal();
  }

  saveEvent() {
    if (!this.tempEvent.start || !this.tempEvent.end) {
      alert('Veuillez sélectionner une plage horaire valide.');
      return;
    }

    const safeTitle = this.tempEvent.title || this.tempEvent.type || 'Sans titre';

    const payload: CalendarEvent = {
      ...this.tempEvent,
      id: this.selectedEventId ?? undefined,
      userId: this.userId,
      title: safeTitle,
      color: this.tempEvent.groupId ? '#3b82f6' : this.tempEvent.color,
    };

    const request = this.isEditMode && this.selectedEventId
      ? this._calendarService.updateEvent(this.selectedEventId, payload)
      : this._calendarService.saveEvent(payload);

    request.subscribe({
      next: () => {
        this.loadUnifiedEvents();
        this.closeModal();
      },
      error: (err) => {
        console.error('Erreur lors de la sauvegarde', err);
      },
    });
  }

  deleteEvent() {
    if (this.selectedEventId) {
      this._calendarService.deleteEvent(this.selectedEventId).subscribe({
        next: () => {
          this.loadUnifiedEvents();
          this.closeModal();
        },
        error: (err) => console.error('Erreur lors de la suppression', err)
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
      groupId: this.groupId || null,
      userId: this.userId,
    };
  }

  openModal() {
    this.showModal = true;
    this._cdr.detectChanges();
  }

  closeModal() {
    this.showModal = false;
    this._cdr.detectChanges();
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    this.closeModal();
  }
}