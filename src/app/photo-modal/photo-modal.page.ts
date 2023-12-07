import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-photo-modal',
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button (click)="closeModal()">
            <ion-icon slot="icon-only" name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content [fullscreen]="true" class="ion-padding">
      <img [src]="photoUrl" alt="Fullscreen Photo" class="fullscreen-photo">
    </ion-content>
  `,
  styles: [`
    .fullscreen-photo {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `]
})
export class PhotoModalPage {
  @Input() photoUrl: string;

  constructor(private modalController: ModalController) {
    this.photoUrl = ''; // Or provide a default value
  }
  

  closeModal() {
    this.modalController.dismiss();
  }
}
