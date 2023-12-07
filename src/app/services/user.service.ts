// user.service.ts
import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { ToastController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Firestore, collectionData, collection, doc, setDoc, deleteDoc, docSnapshots, CollectionReference, DocumentReference, addDoc, query, where, getDocs } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UserCredential } from '@firebase/auth-types';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  currentUser: User | null = null; // New property to store the current user
  
  constructor(private afAuth: AngularFireAuth, private firestore: Firestore, private toastCtrl: ToastController) {}

  private generateRandomString(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  private async isIdUnique(id: string): Promise<boolean> {
    const usersCollection = collection(this.firestore, 'users') as CollectionReference<User>;
    const q = query(usersCollection, where('id', '==', id));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  }

  private async isAlbumIdUnique(albumId: string): Promise<boolean> {
    const usersCollection = collection(this.firestore, 'users') as CollectionReference<User>;
    const q = query(usersCollection, where('albumId', '==', albumId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  }

  private async isEmailUnique(email: string): Promise<boolean> {
    const usersCollection = collection(this.firestore, 'users') as CollectionReference<User>;
    const q = query(usersCollection, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  }

  private async generateUniqueRandomString(length: number): Promise<string> {
    let randomString: string;
    do {
      randomString = this.generateRandomString(length);
    } while (!(await this.isIdUnique(randomString)));
    return randomString;
  }

  private async generateUniqueAlbumId(length: number): Promise<string> {
    let randomAlbumId: string;
    do {
      randomAlbumId = this.generateRandomString(length);
    } while (!(await this.isAlbumIdUnique(randomAlbumId)));
    return randomAlbumId;
  }

  getUsers(): Observable<User[]> {
    const usersCollection = collection(this.firestore, 'users');
    return collectionData(usersCollection, { idField: 'id' })
      .pipe(
        map(users => users as User[])
      );
  }

  getUserById(id: string): Promise<User> {
    const document = doc(this.firestore, 'users', id) as DocumentReference<User>;
  
    return new Promise((resolve, reject) => {
      docSnapshots(document)
        .pipe(
          map(doc => {
            if (doc.exists()) {
              const data = doc.data();
              return { ...data, id } as User;
            } else {
              reject(new Error('User document not found'));
              return null;
            }
          })
        )
        .subscribe(
          (user: User | null) => resolve(user as User | PromiseLike<User>),
          (error) => reject(error)
        );
    });
  }  

  getUserByEmail(email: string): Promise<User> {
    const usersCollection = collection(this.firestore, 'users') as CollectionReference<User>;
    const q = query(usersCollection, where('email', '==', email));
  
    return new Promise((resolve, reject) => {
      getDocs(q)
        .then((querySnapshot) => {
          if (!querySnapshot.empty) {
            // Assuming there's only one user with the given email
            const data = querySnapshot.docs[0].data();
            resolve({ ...data, email } as User);
          } else {
            reject(new Error('User document not found'));
          }
        })
        .catch((error) => reject(error));
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

  async createUser(user: User): Promise<void> {
    if (!(await this.isEmailUnique(user.email))) {
      this.presentToast('Email already registered');
      return;
    }
  
    // Generate unique random id and albumId
    user.id = await this.generateUniqueRandomString(5);
    user.albumId = await this.generateUniqueAlbumId(5);
  
    const usersCollection = collection(this.firestore, 'users') as CollectionReference<User>;
    try {
      // Add the user document to Firestore
      await addDoc(usersCollection, user);
      this.presentToast('Cadastro realizado com sucesso, parabéns!', 'success');
  
      // Create user with email and password
      await this.afAuth.createUserWithEmailAndPassword(user.email, user.password);
    } catch (error) {
      console.error('Error creating user:', error);
      this.presentToast('Error creating user. Please try again.');
    }
  }  
  
    
  updateUser(user: User): Promise<void> {
    const document = doc(this.firestore, 'users', user?.id) as DocumentReference<User>; // Ensure the correct type
    const { id, ...data } = user; // exclude the id when saving the document
    return setDoc(document, data);
  }

  deleteUser(id: string): Promise<void> {
    const document = doc(this.firestore, 'users', id);
    return deleteDoc(document);
  }

  // Log in with email and password
  async login(email: string, password: string): Promise<User | null> {
    try {
      const result: UserCredential = await this.afAuth.signInWithEmailAndPassword(email, password);
      const user: User = {
        id: result.user?.uid || '',
        email: result.user?.email || '',
        fullName: '', // Placeholder for full name
        password: '', // Avoid storing passwords in plain text
        albumId: '', // Placeholder for albumId
        gender: '',
        birth: '',
        phone: '',
        contacts: [],
        photos: [],
      };

      // Store the current user
      this.currentUser = user;

      // Fetch additional user data using getUserById
      try {
        const userData = await this.getUserByEmail(user.email);
        if (userData) {
          // Update the currentUser with additional data
          this.currentUser = {
            ...user,
            fullName: userData.fullName || '',
            albumId: userData.albumId || '',
            gender: userData.gender || '',
            birth: userData.birth || '',
            phone: userData.phone || '',
            contacts: userData.contacts || [],
            photos: userData.photos || [],
          };

          console.log(this.currentUser);
        } else {
          console.error('User data not found');
        }
      } catch (getUserError) {
        console.error('Error fetching user data:', getUserError);
      }

      return this.currentUser;
    } catch (error) {
      console.error('Login error', error);
      return null; // Return null in case of an error
    }
  }
  
    signOut(): Promise<void> {
      return this.afAuth.signOut();
    }
  

}