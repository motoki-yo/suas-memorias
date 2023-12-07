export class User { 
  birth: string = '';
  phone: string = '';
  contacts: Array<User> = [];
  id: string;
  fullName: string = '';
  email: string = '';
  password: string = '';
  albumId: string = '';
  photos: Array<string> = [];
  gender: string = '';


  constructor() {
    this.id = '';
  }
}
