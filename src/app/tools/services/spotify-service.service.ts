import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * Interface for the Spotify API token response
 */
interface TokenResponse {
  access_token: string;
  expires_in: number;
}

/**
 * Service for interacting with the Spotify API
 * Handles authentication and provides methods for various API endpoints
 */
@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  private clientId = environment.spotifyClientId;
  private clientSecret = environment.spotifyClientSecret;
  private tokenUrl = 'https://accounts.spotify.com/api/token';
  private apiUrl = 'https://api.spotify.com/v1';
  private accessToken: string | null = null;
  private tokenExpiration: number = 0;

  constructor(private http: HttpClient) { }

  /**
   * Retrieves an access token for the Spotify API
   * If a valid token exists, it returns it; otherwise, it requests a new one
   * @returns An Observable that emits the access token
   */
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

  /**
   * Generates headers with the current access token
   * @returns An Observable that emits HttpHeaders
   */
  private getHeaders(): Observable<HttpHeaders> {
    return this.getAccessToken().pipe(
      map(token => new HttpHeaders({
        'Authorization': `Bearer ${token}`
      }))
    );
  }

  /**
   * Searches for tracks on Spotify
   * @param query The search query string
   * @returns An Observable that emits the search results
   */
  searchAlbum(query: string): Observable<any> {
    return this.getHeaders().pipe(
      switchMap(headers => 
        this.http.get(`${this.apiUrl}/search?q=${query}&type=track`, { headers })
      )
    );
  }

  /**
   * Retrieves details for a specific album
   * @param albumId The Spotify ID of the album
   * @returns An Observable that emits the album details
   */
  getAlbumDetails(albumId: string): Observable<any> {
    return this.getHeaders().pipe(
      switchMap(headers => 
        this.http.get(`${this.apiUrl}/albums/${albumId}`, { headers })
      )
    );
  }

  /**
   * Retrieves details for one or more tracks
   * @param trackIds A comma-separated string of Spotify track IDs
   * @returns An Observable that emits the track details
   */
  getTrackDetails(trackIds: string): Observable<any> {
    return this.getHeaders().pipe(
      switchMap(headers => 
        this.http.get(`${this.apiUrl}/tracks?ids=${trackIds}`, { headers })
      )
    );
  }
}