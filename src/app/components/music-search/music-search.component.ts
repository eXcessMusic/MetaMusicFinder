import { Component, OnInit } from '@angular/core';
import { SpotifyService } from '../../tools/services/spotify-service.service';
import { catchError, finalize } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { of } from 'rxjs';

/**
 * Component for handling music search functionality
 * This component allows users to search for music tracks on Spotify
 */
@Component({
  selector: 'app-music-search',
  templateUrl: './music-search.component.html',
  styleUrls: ['./music-search.component.scss']
})
export class MusicSearchComponent implements OnInit {
  // The current search query entered by the user
  searchQuery: string = '';
  // Array to store the search results from Spotify
  spotifyResults: any[] = [];
  // String to store any error messages that occur during the search
  errorMessage: string = '';
  // Boolean to track if a search is in progress
  isLoading: boolean = false;

  /**
   * Constructor for MusicSearchComponent
   * @param spotifyService Injected SpotifyService for making API calls to Spotify
   * @param titleService Injected Title service for setting page title
   */
  constructor(private spotifyService: SpotifyService, private titleService: Title) {}

  ngOnInit() {
    this.titleService.setTitle('MetaMusicFinder - Search'); // Set the default title of the page
  }

  /**
   * Performs a search for music tracks on Spotify based on the user's input
   * This method is typically called when the user submits the search form
   */
  search() {
    // Only perform the search if there's a non-empty search query
    if (this.searchQuery) {
      // Reset error message and clear previous results
      this.isLoading = true;
      this.errorMessage = '';
      this.spotifyResults = [];

      // Call the SpotifyService to perform the search
      this.spotifyService.searchAlbum(this.searchQuery)
        .pipe(
          catchError(error => {
            console.error('Error searching Spotify:', error);
            this.errorMessage = 'An error occurred while searching. Please try again.';
            // Return an empty observable to continue the stream
            return of(null);
          }),
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe(searchResponse => {
          // Check if the response contains valid search results
          if (searchResponse && searchResponse.tracks && searchResponse.tracks.items) {
            // Store the search results
            this.spotifyResults = searchResponse.tracks.items;
          } else if (!this.errorMessage) {
            // If no results found and no error has been set, display a "No results" message
            this.errorMessage = 'No results found.';
          }
        });
    }
  }
}