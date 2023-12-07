// auth.service.ts
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UserCredential } from '@firebase/auth-types';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  currentUser: User | null = null; // New property to store the current user

  constructor(private afAuth: AngularFireAuth) {}

  // Log in with email and password
  async login(email: string, password: string): Promise<User | null> {
    try {
      const result: UserCredential = await this.afAuth.signInWithEmailAndPassword(email, password);
      const user: User = {
        id: result.user?.uid || '',
        email: result.user?.email || '',
        fullName: '', // Fetch the user's full name from Firestore here
        password: '', // Avoid storing passwords in plain text
        albumId: '', // Fetch the user's albumId from Firestore here
      };

      // Store the current user
      this.currentUser = user;

      console.log("Current user fullName: "+ this.currentUser);

      return user;
    } catch (error) {
      console.error('Login error', error);
      return null; // Return null in case of an error
    }
  }

  signOut(): Promise<void> {
    return this.afAuth.signOut();
  }
}
