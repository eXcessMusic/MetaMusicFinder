import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DjangoApiService {
  private apiUrl = 'http://localhost:8000/api'; // Replace with your Django API URL

  constructor(private http: HttpClient) { }

  updateSongDetails(isrc: string, details: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/songs/${isrc}/`, details);
  }
}