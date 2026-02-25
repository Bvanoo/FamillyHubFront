import { Component, inject, OnInit, ChangeDetectorRef, HostListener, input } from '@angular/core';
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
import { Navigation } from '../Services/navigation';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, FormsModule, FullCalendarModule],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.css'],
})
export class Calendar implements OnInit {
  groupId = input<number>();

  private readonly _calendarService = inject(CalendarService);
  private readonly _groupService = inject(GroupService);
  private readonly _authService = inject(AuthService);
  private readonly _cdr = inject(ChangeDetectorRef);
  private readonly _nav = inject(Navigation);

  showModal = false;
  isEditMode = false;
  userId: number = 0;
  selectedEventId: number | null = null;
  myGroups: any[] = [];

  newTaskTitle: string = '';
  newTaskAssignedUserIds: string[] = [];
  groupMembers: any[] = [];

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
    tasks: [],
  };

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    locale: frLocale,
    timeZone: 'local',
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

    if (!this.groupId()) {
      this.loadMyGroups();
    }
  }

  renderEventContent(arg: any) {
    const props = arg.event.extendedProps;
    const title = arg.event.title;
    const pic = props.userPicture;
    const name = props.userName || 'Utilisateur';
    const isPrivate = props.isPrivate;
    const isMyEvent = props.userId === this.userId;

    let imgHtml = pic
      ? `<img src="${pic}" style="width: 18px; height: 18px; border-radius: 50%; object-fit: cover; margin-right: 5px; flex-shrink: 0;" onerror="this.style.display='none'">`
      : `<span style="margin-right: 5px; font-size: 14px; color: #64748b;"><i class="fas fa-user"></i></span>`;

    let lockIcon =
      isMyEvent && isPrivate
        ? `<i class="fas fa-lock" style="margin-right: 4px; font-size: 0.8em;"></i>`
        : '';

    return {
      html: `<div title="${name} : ${title}" style="display: flex; align-items: center; overflow: hidden; padding: 2px;">
               ${imgHtml}
               <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.9em;">
                 ${lockIcon}<b>${name}</b> : ${title}
               </span>
             </div>`,
    };
  }

  loadUnifiedEvents() {
    const currentGroupId = this.groupId();
    const request$ = currentGroupId
      ? this._calendarService.getGroupEvents(currentGroupId)
      : this._calendarService.getUnifiedEvents();

    request$.subscribe({
      next: (events: any[]) => {
        const mappedEvents = events.map((e: any) => {
          const isPrivate = e.isPrivate || e.IsPrivateEvent || e.IsPrivate;
          let bgColor = e.color || e.Color || '#3b82f6';
          let displayTitle = e.title || e.Title || 'Sans titre';

          let picUrl = e.userPicture;
          if (picUrl && !picUrl.startsWith('http')) {
            picUrl = `${this._nav.baseUrlProd}${picUrl}`;
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
              type: e.type || e.Type,
              tasks: e.tasks || e.Tasks || [],
            },
          };
        });

        this.calendarOptions = {
          ...this.calendarOptions,
          events: mappedEvents,
        };
        this._cdr.detectChanges();
      },
      error: (err) => console.error('Erreur chargement événements:', err),
    });
  }

  loadMyGroups() {
    this._groupService.getMyGroups().subscribe({
      next: (groups) => (this.myGroups = groups),
      error: (err) => console.error('Erreur chargement groupes:', err),
    });
  }

  fetchGroupMembers(groupId: number) {
    this._groupService.getGroupMembers(groupId).subscribe({
      next: (members) => (this.groupMembers = members),
      error: (err) =>
        console.error('Erreur chargement membres du groupe:', err),
    });
  }

  private formatForInput(
    dateStr: string,
    isAllDay: boolean,
    isEnd: boolean = false,
  ): string {
    if (isAllDay || dateStr.length <= 10) {
      const datePart = dateStr.substring(0, 10);
      return isEnd ? `${datePart}T09:00` : `${datePart}T08:00`;
    }
    return dateStr.substring(0, 16);
  }

  handleSelect(selectInfo: DateSelectArg) {
    this.isEditMode = false;
    this.resetTempEvent();
    this.tempEvent.start = this.formatForInput(
      selectInfo.startStr,
      selectInfo.allDay,
    );
    this.tempEvent.end = this.formatForInput(
      selectInfo.endStr,
      selectInfo.allDay,
      true,
    );

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
      start: this.formatForInput(
        clickInfo.event.startStr,
        clickInfo.event.allDay,
      ),
      end: clickInfo.event.endStr
        ? this.formatForInput(
            clickInfo.event.endStr,
            clickInfo.event.allDay,
            true,
          )
        : this.formatForInput(clickInfo.event.startStr, clickInfo.event.allDay),
      color: clickInfo.event.backgroundColor,
      type: props['type'] || 'Disponible',
      isPrivate: isPrivate || false,
      maskDetails: props['maskDetails'] || false,
      groupId: props['groupId'] || null,
      tasks: props['tasks'] || [],
    };

    if (this.tempEvent.groupId) {
      this.fetchGroupMembers(this.tempEvent.groupId);
    }

    this.openModal();
  }

  saveEvent() {
    if (!this.tempEvent.start || !this.tempEvent.end) {
      alert('Veuillez sélectionner une plage horaire valide.');
      return;
    }

    const safeTitle =
      this.tempEvent.title || this.tempEvent.type || 'Sans titre';

    const payload: CalendarEvent = {
      ...this.tempEvent,
      id: this.selectedEventId ?? undefined,
      userId: this.userId,
      title: safeTitle,
      start: new Date(this.tempEvent.start).toISOString(),
      end: new Date(this.tempEvent.end).toISOString(),
      color: this.tempEvent.groupId ? '#3b82f6' : this.tempEvent.color,
    };

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
      },
    });
  }

  addTask() {
    if (!this.selectedEventId || !this.newTaskTitle.trim()) return;

    const dto = {
      title: this.newTaskTitle,
      assignedUserIds: this.newTaskAssignedUserIds.map((id) => id.toString()),
    };

    this._calendarService.addTaskToEvent(this.selectedEventId, dto).subscribe({
      next: (res) => {
        if (!this.tempEvent.tasks) this.tempEvent.tasks = [];
        this.tempEvent.tasks.push({
          id: res.taskId || res.Id,
          title: dto.title,
          isCompleted: false,
          assignedUserNames: this.groupMembers
            .filter((m) =>
              dto.assignedUserIds.includes(
                m.userId?.toString() || m.UserId?.toString(),
              ),
            )
            .map((m) => m.name || m.Name),
        });

        this.newTaskTitle = '';
        this.newTaskAssignedUserIds = [];
        this.loadUnifiedEvents();
      },
      error: (err) => console.error("Erreur lors de l'ajout de la tâche", err),
    });
  }

  deleteEvent() {
    if (this.selectedEventId) {
      this._calendarService.deleteEvent(this.selectedEventId).subscribe({
        next: () => {
          this.loadUnifiedEvents();
          this.closeModal();
        },
        error: (err) => console.error('Erreur lors de la suppression', err),
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
      groupId: this.groupId() || null,
      userId: this.userId,
      tasks: [],
    };
    this.newTaskTitle = '';
    this.newTaskAssignedUserIds = [];
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
