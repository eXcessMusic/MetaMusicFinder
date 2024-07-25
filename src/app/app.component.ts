import { Component, OnInit, AfterViewInit } from '@angular/core';
import { SpotifyService } from './tools/services/spotify-service.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  constructor(private spotifyService: SpotifyService) {}

  ngOnInit() {
    console.log('App component initialized');
  }

  ngAfterViewInit() {
    console.log('View initialized');
    if (typeof window !== 'undefined') {
      this.spotifyService['initializeCredentials']();
    }
  }
}