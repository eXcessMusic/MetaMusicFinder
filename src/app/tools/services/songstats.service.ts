import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SongstatsService {
  private apiBaseUrl = 'https://api.songstats.com/enterprise/v1';
  private apiKey = '144f72d8-6b16-4dab-9c5c-14dc36d34f40';


  constructor(private http: HttpClient) { }

  // getTrackInfo(isrc: string): Observable<any> {
  //   const url = `${this.apiBaseUrl}/tracks/info`;
  //   const headers = { 'apikey': `${this.apiKey}` };
  //   const params = new HttpParams().set('isrc', isrc);
  //   return this.http.get(url, { headers, params });
  // }

  getTrackInfo(isrc: string): Observable<any> {
    const headers = new HttpHeaders({
      'apikey': this.apiKey
    });
    // https://api.songstats.com/enterprise/v1/tracks/info?isrc=QZS652416230
    const url = `${this.apiBaseUrl}/tracks/info?isrc=${isrc}`;
    return this.http.get(url, { headers });
  }
}