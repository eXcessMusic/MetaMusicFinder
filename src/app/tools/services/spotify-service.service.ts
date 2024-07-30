import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SpotifyService {
  private apiUrl = environment.backendUrl || 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  /**
   * Searches for tracks on Spotify
   * @param query The search query string
   * @returns An Observable that emits the search results
   */
  searchAlbum(query: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/search`, {
      params: { q: query, type: 'track,album' }
    });
  }

  /**
   * Retrieves details for a specific album
   * @param albumId The Spotify ID of the album
   * @returns An Observable that emits the album details
   */
  getAlbumDetails(albumId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/albums/${albumId}`);
  }

  /**
   * Retrieves details for one or more tracks
   * @param trackIds A comma-separated string of Spotify track IDs
   * @returns An Observable that emits the track details
   */
  getTrackDetails(trackIds: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/tracks`, {
      params: { ids: trackIds }
    });
  }
}