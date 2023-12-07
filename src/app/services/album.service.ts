import { Injectable } from '@angular/core';
import { Album } from '../models/album';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Firestore, collectionData, collection, doc, setDoc, deleteDoc, docSnapshots } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AlbumService {

  constructor(private firestore: Firestore) {}

  getAlbums(): Observable<Album[]> {
    const albumsCollection = collection(this.firestore, 'albums');
    return collectionData(albumsCollection, { idField: 'id' })
      .pipe(
        map(albums => albums as Album[])
      );
  }

  getAlbumById(id: string): Observable<Album> {
    const document = doc(this.firestore, `albums/${id}`);
    return docSnapshots(document)
      .pipe(
        map(doc => {
          const id = doc.id;
          const data = doc.data();
          return { id, ...data } as Album;
        })
      );
  }

  createAlbum(album: Album): Promise<void> {
    const document = doc(collection(this.firestore, 'albums'));
    return setDoc(document, album);
  }

  updateAlbum(album: Album): Promise<void> {
    const document = doc(this.firestore, 'albums', album?.id);
    const { id, ...data } = album; // exclude the id when saving the document
    return setDoc(document, data);
  }

  deleteAlbum(id: string): Promise<void> {
    const document = doc(this.firestore, 'albums', id);
    return deleteDoc(document);
  }
}
