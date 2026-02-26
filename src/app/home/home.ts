import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarService } from '../Services/calendar-service';
import { AuthService } from '../Services/auth-service';
import { Navigation } from '../Services/navigation';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  private readonly _calendarService = inject(CalendarService);
  private readonly _authService = inject(AuthService);
  private _cdr = inject(ChangeDetectorRef);
  _nav = inject(Navigation);

  upcomingEvents: any[] = [];
  currentUserId: number = 0;

  ngOnInit() {
    const user = this._authService.getUser();
    if (user) {
      this.currentUserId = user.id || user.Id;
    }
    
    this.loadUpcomingEvents();
  }

  loadUpcomingEvents() {
  this._calendarService.getUnifiedEvents().subscribe({
    next: (events: any[]) => {

      const now = new Date(); 
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      this.upcomingEvents = events
        .filter(e => {
          const rawDate = e.start || e.Start;
          const eventDate = new Date(rawDate);
          
          const isFutureOrToday = eventDate >= startOfToday; 
          
          const eventUserId = e.userId || e.UserId;
          const isPrivate = e.isPrivate || e.IsPrivateEvent || e.IsPrivate === true;
          
          const isSomeoneElsesPrivate = isPrivate && eventUserId !== this.currentUserId;

          console.log(`🔍 Analyse de "${e.title || e.Title}" :`, {
            dateBrute: rawDate,
            dateJS: eventDate,
            estDansLeFutur: isFutureOrToday,
            monId: this.currentUserId,
            createurId: eventUserId,
            estPrive: isPrivate,
            seraCache: isSomeoneElsesPrivate
          });

          return isFutureOrToday && !isSomeoneElsesPrivate;
        })
        .map(e => {
          let picUrl = e.userPicture || e.UserPicture;
          if (picUrl && !picUrl.startsWith('http')) {
            picUrl = `https://localhost:7075${picUrl}`;
          }

          return {
            ...e,
            parsedStart: new Date(e.start || e.Start),
            userPicture: picUrl,
            userName: e.userName || e.UserName || 'Utilisateur',
            title: e.title || e.Title || 'Sans titre',
            description: e.description || e.Description,
            isGroupEvent: !!(e.groupId || e.GroupId),
            groupId: e.groupId || e.GroupId,
            color: e.color || e.Color || '#3b82f6'
          };
        })
        .sort((a, b) => a.parsedStart.getTime() - b.parsedStart.getTime())
        .slice(0, 12);
        this._cdr.detectChanges();

    },
    error: err => console.error("Erreur chargement des événements:", err)
  });
}

  goToCalendar(groupId: number | null | undefined) {
    if (groupId) {
      this._nav.goToGroupDetail(groupId); 
    } else {
      this._nav.goToCalendar();
    }
  }
}