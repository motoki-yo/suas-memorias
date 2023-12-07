import { Component, OnInit } from '@angular/core';
import { User } from '../models/user';
import { UserService } from '../services/user.service';
import { NavController, MenuController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  userData: any;
  editedUserData: any = {};
  changesMade: boolean = false;

  constructor(private userService: UserService, private menuController: MenuController, private navCtrl: NavController) {
    this.userData = {};
    this.editedUserData = { ...this.userData };
  }

  ngAfterViewInit() {
    this.userData = this.userService.currentUser;
    // Fetch user photos and assign them to the photos array
    if (this.userData) {
      this.userService.getUserByEmail(this.userData?.email).then((user) => {
        if (user && user.photos) {
          this.editedUserData = { ...this.userData };
        }
      });
    }
  }

  onInputChange() {
    this.changesMade = true;
  }

  // Method to save changes to user data in the database
  saveChanges() {
    // Check if any changes have been made
    if (this.changesMade) {
      // Merge the changes into the original user data
      const updatedUserData = { ...this.userData, ...this.editedUserData };
      console.log(updatedUserData)
      // Update the user in the database
      this.userService.updateUser(updatedUserData)
        .then(() => {
          // Reset the changesMade flag after successful update
          this.changesMade = false;
          // Optionally, you can also update userData with the latest changes
          this.userData = updatedUserData;
        })
        .catch((error) => {
          console.error('Error updating user:', error);
        });
    }
  }

  async openMenu() {
    const isOpen = await this.menuController.isOpen();
    if (!isOpen) {
      await this.menuController.open('end');
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