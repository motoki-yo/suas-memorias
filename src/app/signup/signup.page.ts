// signup.page.ts
import { Component, OnInit, NgZone } from '@angular/core';
import { NavController } from '@ionic/angular';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { UserService } from '../services/user.service';
import { User } from '../models/user'


@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  signupForm: FormGroup;
  showPassword: boolean = false;

  constructor(private userService: UserService, private navCtrl: NavController, private toastCtrl: ToastController, public router: Router, private ngZone: NgZone,) {
    this.signupForm = new FormGroup({
      'fullName': new FormControl('', Validators.required),
      'email': new FormControl('', [Validators.required, Validators.email]),
      'password': new FormControl('', [Validators.required, Validators.minLength(6)]),
    });
  } 

  ngOnInit(): void {
    this.signupForm = new FormGroup({
      'fullName': new FormControl('', Validators.required),
      'email': new FormControl('', [Validators.required, Validators.email]),
      'password': new FormControl('', [Validators.required, Validators.minLength(6)]),
    });
  }

  async presentToast(message: string, color: string = 'danger') {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'top',
      color,
    });
    toast.present();
  }

  redirectLoggedUserToApp() {
    this.ngZone.run(() => {
      this.router.navigate(['/tabs', 'tab1']);
    });
  }

  async signup() {
    try {
      if (this.signupForm.valid) {
        const { fullName, email, password } = this.signupForm.value;

        // Create a new user object with required properties
        const newUser: User = {
          id: '', // You can generate a unique ID here or leave it empty if your service handles it
          fullName,
          email,
          password,
          albumId: '',
          gender: '',
          birth: '',
          phone: '',
          contacts: [],
          photos: []
        };
  
        // Call the createUser method from the UserService
        await this.userService.createUser(newUser);
  
        // After a successful signup, you can navigate to another page
        this.redirectLoggedUserToApp();
      } else {
        // Form is invalid, handle accordingly (show errors, etc.)
        this.presentToast('Por favor, preencha todos os campos de cadastro!');
        console.error('Invalid form');
      }
    } catch (error) {
      console.error('Sign Up error', error);
      this.presentToast('Houve um problema ao realizar o cadastro. Tente novamente em alguns instantes.');
      // Handle error, show alert, etc.
    }
  }

  // Method to navigate back to the login page
  goToLogin() {
    this.navCtrl.navigateBack('/login');
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
