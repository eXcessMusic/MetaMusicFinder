import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

declare global {
  interface Window {
    RUNTIME_CONFIG?: {
      SPOTIFY_CLIENT_ID?: string;
      SPOTIFY_CLIENT_SECRET?: string;
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  private clientId: string = '';
  private clientSecret: string = '';
  private tokenUrl = 'https://accounts.spotify.com/api/token';
  private apiUrl = 'https://api.spotify.com/v1';
  private accessToken: string | null = null;
  private tokenExpiration: number = 0;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    console.log('SpotifyService constructor called');
    
    if (isPlatformBrowser(this.platformId)) {
      console.log('Running in browser');
      this.initializeCredentials();
    } else {
      console.log('Running on server');
    }
  }

  private initializeCredentials(): void {
    console.log('Window RUNTIME_CONFIG:', window.RUNTIME_CONFIG);
    
    this.clientId = window.RUNTIME_CONFIG?.SPOTIFY_CLIENT_ID || '';
    this.clientSecret = window.RUNTIME_CONFIG?.SPOTIFY_CLIENT_SECRET || '';

    console.log('ClientId:', this.clientId);
    console.log('ClientSecret:', this.clientSecret);

    if (!this.clientId || !this.clientSecret) {
      console.error('Spotify credentials are not set properly');
    }
  }

  private getAccessToken(): Observable<string> {
    if (this.accessToken && Date.now() < this.tokenExpiration) {
      return from(Promise.resolve(this.accessToken));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(this.clientId + ':' + this.clientSecret)
    });

    const body = 'grant_type=client_credentials';

    return this.http.post<TokenResponse>(this.tokenUrl, body, { headers }).pipe(
      map((response: TokenResponse) => {
        this.accessToken = response.access_token;
        this.tokenExpiration = Date.now() + (response.expires_in * 1000);
        return this.accessToken;
      }),
      catchError(error => {
        console.error('Error getting access token', error);
        return throwError(() => new Error('Failed to get access token'));
      })
    );
  }

  private getHeaders(): Observable<HttpHeaders> {
    return this.getAccessToken().pipe(
      map(token => new HttpHeaders({
        'Authorization': `Bearer ${token}`
      }))
    );
  }

  searchAlbum(query: string): Observable<any> {
    return this.getHeaders().pipe(
      switchMap(headers => 
        this.http.get(`${this.apiUrl}/search?q=${query}&type=track`, { headers })
      )
    );
  }

  getAlbumDetails(albumId: string): Observable<any> {
    return this.getHeaders().pipe(
      switchMap(headers => 
        this.http.get(`${this.apiUrl}/albums/${albumId}`, { headers })
      )
    );
  }

  getTrackDetails(trackIds: string): Observable<any> {
    return this.getHeaders().pipe(
      switchMap(headers => 
        this.http.get(`${this.apiUrl}/tracks?ids=${trackIds}`, { headers })
      )
    );
  }
}