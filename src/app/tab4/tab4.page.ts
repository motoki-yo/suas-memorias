import { Component, AfterViewInit } from '@angular/core';
import { MenuController, ModalController } from '@ionic/angular';
import { UserService } from '../services/user.service';
import { NavController } from '@ionic/angular';
import { User } from '../models/user'; // Import the User model
import { PhotoModalPage } from '../photo-modal/photo-modal.page';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
})
export class Tab4Page implements AfterViewInit {
  photos: Array<string> = [];
  currentUser!: User | null;
  newPhotoUrl: string = ''; // Variable to store the new photo URL

  constructor(
    private menuController: MenuController,
    public userService: UserService,
    private navCtrl: NavController,
    private modalController: ModalController
  ) {}

  // Fetch user photos when the component initializes (you can modify this based on your data retrieval mechanism)
  ngAfterViewInit() {
    this.currentUser = this.userService.currentUser;
    // Fetch user photos and assign them to the photos array
    if (this.currentUser) {
      this.userService.getUserByEmail(this.currentUser?.email).then((user) => {
        if (user && user.photos) {
          this.photos = user.photos;
        }
      });
    }
  }

 

  async openPhotoModal(photoUrl: string) {
    const modal = await this.modalController.create({
      component: PhotoModalPage,
      componentProps: {
        photoUrl: photoUrl
      },
      cssClass: 'fullscreen-modal'
    });

    return await modal.present();
  }

  // Method to add a new photo to the array and update the user in the database
  addPhoto() {
    if (this.newPhotoUrl.trim() !== '') {
      // Update the local array
      this.photos.push(this.newPhotoUrl);
      console.log(this.currentUser)
      // Update the user in the database
      if (this.currentUser) {
        this.currentUser.photos = this.photos;
        this.userService.updateUser(this.currentUser);
      }

      this.newPhotoUrl = ''; // Clear the input field after adding
    }
  }

  // Function to open the menu
  async openMenu() {
    // Check if the menu is not already open before opening it
    const isOpen = await this.menuController.isOpen();
    if (!isOpen) {
      await this.menuController.open('end'); // 'end' is the side where the menu is located
    }
  }

  logout() {
    this.userService.signOut().then(
      (res) => {
        this.navCtrl.navigateRoot('login');
      },
      (error) => {
        console.log('Logout error', error);
      }
    );
  }
}
