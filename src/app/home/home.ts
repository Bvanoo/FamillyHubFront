import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CalendarService } from '../Services/calendar-service';
import { AuthService } from '../Services/auth-service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  private readonly _calendarService = inject(CalendarService);
  private readonly _authService = inject(AuthService);
  private _router = inject(Router);

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
        
        this.upcomingEvents = events
          .filter(e => {
            const eventDate = new Date(e.start || e.Start);
            const isFuture = eventDate > now;
            
            const eventUserId = e.userId || e.UserId;
            const isPrivate = e.isPrivate || e.IsPrivateEvent;
            
            const isSomeoneElsesPrivate = isPrivate && eventUserId !== this.currentUserId;

            return isFuture && !isSomeoneElsesPrivate;
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
          .slice(0, 6);
      },
      error: err => console.error("Erreur chargement des événements:", err)
    });
  }

  goToCalendar(groupId: number | null | undefined) {
    if (groupId) {
      this._router.navigate(['/group-details', groupId]); 
    } else {
      this._router.navigate(['/calendar']);
    }
  }
}