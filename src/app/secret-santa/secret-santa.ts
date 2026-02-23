import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-secret-santa',
  imports: [CommonModule, FormsModule],
  templateUrl: './secret-santa.html',
  styleUrls: ['./secret-santa.css']
})
export class SecretSanta implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  resultId = 0;
  userId = 0;
  isGiver = signal(false);
  targetName = signal('');
  messages = signal<any[]>([]);
  newMessage = '';
  wishlist = signal('');

  ngOnInit() {
    this.resultId = Number(this.route.snapshot.paramMap.get('id'));
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userId = user.id;

    this.loadChat();
    this.loadPairInfo();
  }

  loadPairInfo() {
    this.http.get<any>(`https://localhost:7075/api/Randomizer/my-target/${this.resultId}/${this.userId}`)
      .subscribe(res => {
        this.isGiver.set(res.isGiver);
        this.targetName.set(res.receiverName);
        this.wishlist.set(res.wishlist || '');
      });
  }

  loadChat() {
    this.http.get<any[]>(`https://localhost:7075/api/Randomizer/chat-history/${this.resultId}/${this.userId}`)
      .subscribe(msgs => this.messages.set(msgs));
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const body = {
      resultId: this.resultId,
      senderId: this.userId,
      content: this.newMessage
    };

    this.http.post('https://localhost:7075/api/Randomizer/send-secret-message', body)
      .subscribe(() => {
        this.newMessage = '';
        this.loadChat();
      });
  }

  updateWishlist() {
    this.http.put(`https://localhost:7075/api/Randomizer/update-wishlist/${this.resultId}`, { wishlist: this.wishlist() })
      .subscribe(() => alert("Liste de souhaits mise à jour !"));
  }
}