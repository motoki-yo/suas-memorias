import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { UserService } from '../services/user.service';
import { NavController } from '@ionic/angular';
import { User } from '../models/user';

// tab3.page.ts

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {

    constructor
    (
    private menuController: MenuController,
    public userService: UserService,
    private navCtrl: NavController,
  ) {}

  allUsers: User[] = [];
  searchEmail: string = '';
  userData = this.userService.currentUser;
  
  ngOnInit() {
    this.fetchAllUsers();
  }

  // Function to open the menu
  async openMenu() {
    // Check if the menu is not already open before opening it
    const isOpen = await this.menuController.isOpen();
    if (!isOpen) {
      await this.menuController.open('end'); // 'end' is the side where the menu is located
    }
  }

  logout(){
    this.userService.signOut()
    .then((res) => {
      this.navCtrl.navigateRoot('login');
    }, (error) => {
      console.log("Logout error", error);
    });
  }

    // Function to check if a user is a contact
    isContact(user: User): boolean {
      // Ensure that userData and contacts are not null or undefined
      return (
        this.userData?.contacts !== undefined &&
        this.userData?.contacts?.some((contact: User | string) => {
          // Check if the contact is a User (not a string)
          return typeof contact !== 'string' && contact.id === user.id;
        }) || false
      );
    }

  // Function to add or remove user from contacts
  toggleContact(user: User) {
    const existingContacts: User[] = this.userData?.contacts || [];
    
    // Check if the user is already a contact
    const isAlreadyContact = this.isContact(user);
  
    if (isAlreadyContact) {
      // Remove the user from contacts
      this.userData!.contacts = existingContacts.filter(
        (contact: User) => contact.id !== user.id
      );
    } else {
      // Check if the maximum limit of 4 contacts is reached
      if (existingContacts.length < 4) {
        // Add the user to contacts
        this.userData!.contacts = [...existingContacts, user];
      } else {
        // Display a message or handle accordingly (maximum limit reached)
        console.log('Maximum limit of contacts reached (4)');
      }
    }
  
    // Update the user in the database
    this.userService.updateUser(this.userData!);
  }

  fetchAllUsers() {
    this.userService.getUsers().subscribe(users => {
      this.allUsers = users;
    });
  }

  filterUsers() {
    const searchTerm = this.searchEmail.toLowerCase();

    // Filter users based on the entered email
    this.allUsers = this.allUsers.filter(user =>
      user.email.toLowerCase().includes(searchTerm)
    );
  }

  isMaxContactsReached(): boolean {
    return this.userData?.contacts?.length === 4 || false;
  }
}
