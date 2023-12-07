import { Component } from '@angular/core';
import { UserService } from './services/user.service';
import { AlbumService } from './services/album.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(private userService: UserService, private albumService: AlbumService) { }

}
