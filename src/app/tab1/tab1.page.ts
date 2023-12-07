import { Component, AfterViewInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { UserService } from '../services/user.service';
import { NavController } from '@ionic/angular';
import { User } from '../models/user'; // Import the User model
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page implements AfterViewInit {
  photos: Array<string> = [];
  currentUser!: User | null;

  constructor(
    private menuController: MenuController,
    public userService: UserService,
    private navCtrl: NavController,
    private cdr: ChangeDetectorRef
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

  newPhotoUrl: string = ''; // Variable to store the new photo URL

// Method to add a new photo to the array and update the user in the database
addPhoto() {
  if (this.newPhotoUrl.trim() !== '') {
    // Update the local array
    this.photos.push(this.newPhotoUrl);
    
    // Update the user in the database
    if (this.currentUser) {
      // Create a copy of the array to avoid any reference issues
      const updatedPhotos = [...this.photos];
      
      // Update the local user object
      this.currentUser.photos = updatedPhotos;

      // Update the user in the database
      this.userService.updateUser(this.currentUser)
        .then(() => {
          console.log('User updated successfully');
        })
        .catch((error) => {
          console.error('Error updating user:', error);
        });
    }

    this.newPhotoUrl = ''; // Clear the input field after adding
  }
}

removePhoto(index: number): void {
  if (this.currentUser) {
    // Create a copy of the array to avoid any reference issues
    const updatedPhotos = [...this.photos];
    
    // Remove the photo at the specified index
    updatedPhotos.splice(index, 1);

    // Update the local user object
    this.currentUser.photos = updatedPhotos;

    // Update the user in the database
    this.userService.updateUser(this.currentUser)
      .then(() => {
        console.log('User updated successfully');
        // Use setTimeout to ensure change detection happens after the update
        setTimeout(() => {
          this.cdr.detectChanges();
        });
      })
      .catch((error) => {
        console.error('Error updating user:', error);
      });
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
