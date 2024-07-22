import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SpotifyService } from '../../tools/services/spotify-service.service';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Title } from '@angular/platform-browser';

/**
 * Interface representing an artist
 */
interface Artist {
  name: string;
  type: 'main' | 'featured';
}

/**
 * Interface representing a processed album from Spotify search results
 */
interface ProcessedAlbum {
  name: string;
  artists: Artist[];
  imageUrl: string;
  spotifyUrl: string;
  releaseDate: string;
  previewUrl: string;
  isrc: string;
  id: string;
}

/**
 * Component for displaying Spotify search results
 */
@Component({
  selector: 'app-spotify-results',
  templateUrl: './spotify-results.component.html',
  styleUrls: ['./spotify-results.component.scss'],
  animations: [
    // Animation trigger for fade in/out effect
    trigger('fadeInOut', [
      state('void', style({ opacity: 0, transform: 'translateY(20%)' })),
      transition('void <=> *', [
        animate('300ms ease-out')
      ])
    ])
  ]
})
export class SpotifyResultsComponent implements OnChanges {
  @Input() results: any[] = [];
  @Input() searchQuery: string = '';  // stores the search query to display
  processedResults: ProcessedAlbum[] = [];
  displayedResults: ProcessedAlbum[] = [];
  selectedIsrc: string | null = null;
  initialDisplayCount: number = 5;
  showAllResults: boolean = false;

  constructor(private spotifyService: SpotifyService, private router: Router, private titleService: Title) { }

  /**
   * Lifecycle hook that is called when any data-bound property of a directive changes
   * @param changes SimpleChanges object containing current and previous property values
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes['results'] && changes['results'].currentValue) {
      this.processResults();
      this.updateDisplayedResults();
    }

    if (this.processedResults && this.processedResults.length > 0) {
      this.titleService.setTitle(`Music Search App - ${this.processedResults.length} Results for "${this.searchQuery}"`);
    } else {
      this.titleService.setTitle('Music Search App - No Results');
    }
  }

  /**
   * Processes the raw Spotify search results into a more usable format
   */
  private processResults() {
    this.processedResults = this.results.map(track => ({
      name: track.name,
      artists: this.processArtists(track),
      imageUrl: track.album.images[0]?.url || '',
      spotifyUrl: track.album.external_urls.spotify,
      releaseDate: track.album.release_date,
      previewUrl: track.preview_url || '',
      isrc: track.external_ids?.isrc || '',
      id: track.album.id
    }));
  }

  /**
   * Updates the displayed results based on whether all results should be shown
   */
  private updateDisplayedResults() {
    this.displayedResults = this.showAllResults
      ? this.processedResults
      : this.processedResults.slice(0, this.initialDisplayCount);
  }

  /**
   * Processes the artists from a track into the Artist interface format
   * @param track The track object from Spotify API
   * @returns An array of Artist objects
   */
  private processArtists(track: any): Artist[] {
    return track.artists.map((artist: any) => ({
      name: artist.name,
      type: 'main' as const
    }));
  }

  /**
   * Formats the artists' names into a comma-separated string
   * @param artists An array of Artist objects
   * @returns A string of comma-separated artist names
   */
  formatArtists(artists: Artist[]): string {
    return artists.map(a => a.name).join(', ');
  }

  /**
   * Navigates to the detail view for a selected track
   * @param track The selected ProcessedAlbum object
   */
  showTrackDetails(track: ProcessedAlbum) {
    this.router.navigate(['/detail', track.id], { queryParams: { isrc: track.isrc } });
  }

  /**
   * Shows all results when the "Show more" button is clicked
   */
  showMoreResults() {
    this.showAllResults = true;
    this.updateDisplayedResults();
  }
}