import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SpotifyService } from '../../tools/services/spotify-service.service';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Title } from '@angular/platform-browser';

interface Artist {
  name: string;
  type: 'main' | 'featured';
}

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

@Component({
  selector: 'app-spotify-results',
  templateUrl: './spotify-results.component.html',
  styleUrls: ['./spotify-results.component.scss'],
  animations: [
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
  @Input() searchQuery: string = '';
  @Input() isLoading: boolean = false; // New input property for loading state
  processedResults: ProcessedAlbum[] = [];
  displayedResults: ProcessedAlbum[] = [];
  selectedIsrc: string | null = null;
  initialDisplayCount: number = 5;
  showAllResults: boolean = false;
  searchQueryCopy: string = '';

  constructor(private spotifyService: SpotifyService, private router: Router, private titleService: Title) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['results'] && changes['results'].currentValue) {
      this.processResults();
      this.updateDisplayedResults();
      this.searchQueryCopy = this.searchQuery;
    }

    if (this.processedResults && this.processedResults.length > 0) {
      this.titleService.setTitle(`MetaMusicFinder - ${this.processedResults.length} Results for "${this.searchQuery}"`);
    } else {
      this.titleService.setTitle('MetaMusicFinder - Search music metadata easily !');
    }
  }

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

  private updateDisplayedResults() {
    this.displayedResults = this.showAllResults
      ? this.processedResults
      : this.processedResults.slice(0, this.initialDisplayCount);
  }

  private processArtists(track: any): Artist[] {
    return track.artists.map((artist: any) => ({
      name: artist.name,
      type: 'main' as const
    }));
  }

  formatArtists(artists: Artist[]): string {
    return artists.map(a => a.name).join(', ');
  }

  showTrackDetails(track: ProcessedAlbum) {
    this.router.navigate(['/detail', track.id], { queryParams: { isrc: track.isrc } });
  }

  showMoreResults() {
    this.showAllResults = true;
    this.updateDisplayedResults();
  }
}