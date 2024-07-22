import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

declare var MusicKit: any;

@Injectable({
  providedIn: 'root'
})

// Ended up not using this service because of Apple's terrible greed :(

export class AppleMusicService {
  private developerToken = 'YOUR_DEVELOPER_TOKEN'; // Replace with your actual developer token
  private apiUrl = 'https://api.music.apple.com/v1';
  private musicKit: any;

  constructor(private http: HttpClient) {
    this.initializeMusicKit();
  }

  private initializeMusicKit() {
    MusicKit.configure({
      developerToken: this.developerToken,
      app: {
        name: 'Your App Name',
        build: '1.0.0'
      }
    });
    this.musicKit = MusicKit.getInstance();
  }

  getAccessToken(): Observable<string> {
    return from(this.musicKit.authorize()).pipe(
      map(() => this.musicKit.musicUserToken)
    );
  }

  searchAlbum(query: string, accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.developerToken,
      'Music-User-Token': accessToken
    });

    return this.http.get(`${this.apiUrl}/catalog/{{storefront}}/search?term=${query}&types=albums`, { headers }).pipe(
      map((response: any) => response.results.albums)
    );
  }
}