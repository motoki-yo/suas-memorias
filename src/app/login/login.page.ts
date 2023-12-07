// login.page.ts
import { Component, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, LoadingController, ToastController } from '@ionic/angular';
import { UserService } from '../services/user.service';
import { User } from '../models/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  loginForm: FormGroup;
  showPassword: boolean = false;

  constructor(
    private userService: UserService,
    private navCtrl: NavController,
    private formBuilder: FormBuilder,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private ngZone: NgZone, 
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
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
      this.router.navigate(['tabs', 'tab1']);
    });
  }

  async login() {
    try {
      if (this.loginForm.valid) {
        const { email, password } = this.loginForm.value;
  
        const loading = await this.loadingCtrl.create({ message: 'Entrando...' });
        await loading.present();
  
        const user: User | null = await this.userService.login(email, password);
        console.log(user)
        if (user !== null) {
          // Successful login
          await loading.dismiss();
          this.redirectLoggedUserToApp();
        } else {
          // Failed authentication
          await loading.dismiss();
          this.presentToast('Autenticação falhou. Por favor, verifique suas credenciais.');
        }
      } else {
        this.presentToast('Por favor, insira credenciais válidas.');
      }
    } catch (error) {
      console.error('Erro no login', error);
      this.presentToast('Autenticação falhou. Por favor, verifique suas credenciais.');
    } finally {
      // Close loading if error 
      await this.loadingCtrl.dismiss();
    }
  }
  
  
  goToSignUp() {
    this.navCtrl.navigateForward('/signup');
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
