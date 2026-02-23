import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-randomizer',
  imports: [CommonModule, FormsModule],
  templateUrl: './randomizer.html',
  styleUrls: ['./randomizer.css']
})
export class Randomizer {
  mode = signal<'cacahuete' | 'tache'>('cacahuete');
  eventTitle = signal<string>('');
  selectedGroupId = signal<string>('');
  isDrawing = signal<boolean>(false);
  drawResult = signal<string | null>(null);

  groups = [
    { id: '1', name: '🏠 Famille', members: ['Papa', 'Maman', 'Alice', 'Bob'] },
    { id: '2', name: '💼 Bureau', members: ['Jean', 'Marc', 'Sophie', 'Julie', 'Tom'] },
    { id: '3', name: '🏀 Club Sport', members: ['Coach', 'Alex', 'Sam'] }
  ];

  get currentMembers(): string[] {
    const group = this.groups.find(g => g.id === this.selectedGroupId());
    return group ? group.members : [];
  }

  setMode(newMode: 'cacahuete' | 'tache') {
    this.mode.set(newMode);
    this.drawResult.set(null);
  }

  onGroupChange(event: any) {
    this.selectedGroupId.set(event.target.value);
    this.drawResult.set(null);
  }

  launchDraw() {
    if (!this.selectedGroupId()) {
      alert("Veuillez sélectionner un groupe d'abord !");
      return;
    }

    if (this.mode() === 'tache') {
      this.drawTask();
    } else {
      this.launchCacahuete();
    }
  }

  private drawTask() {
    const members = this.currentMembers;
    if (members.length === 0) return;

    this.isDrawing.set(true);
    this.drawResult.set(null);

    let counter = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * members.length);
      this.drawResult.set(members[randomIndex]);
      counter++;

      if (counter > 15) {
        clearInterval(interval);
        this.isDrawing.set(false);
      }
    }, 100);
  }

  private launchCacahuete() {
    const title = this.eventTitle() || "L'événement mystère";
    alert(`Envoi de la demande au serveur pour l'événement : ${title}...\n(Le serveur fera le tirage et enverra les notifications !)`);
  }
}