import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';



/**
 * Service for interacting with the Songlink API
 * Provides methods to fetch matching links across various music platforms
 */
@Injectable({
  providedIn: 'root'
})
export class SonglinkService {
  private apiUrl = `${environment.songlinkProxyUrl}/v1-alpha.1/links`;

  constructor(private http: HttpClient) { }

  /**
   * Retrieves matching links for a given music track across various platforms
   * @param url The URL of the track from any supported platform
   * @param userCountry The user's country code (default: 'BE' for Belgium)
   * @param songIfSingle Whether to return a song match instead of an album if possible (default: false)
   * @returns An Observable that emits the matching links data
   */
  getMatchingLinks(url: string, userCountry: string = 'BE', songIfSingle: boolean = false): Observable<any> {
    const params = {
      url: url,
      userCountry: userCountry,
      songIfSingle: songIfSingle.toString()
    };

    return this.http.get(this.apiUrl, { params });
  }
}