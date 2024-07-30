import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SpotifyService } from '../../tools/services/spotify-service.service';
import { SonglinkService } from '../../tools/services/songlink.service';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Title } from '@angular/platform-browser';

/**
 * Interface representing the detailed structure of an album
 * including its tracks and streaming URLs across platforms
 */
interface DetailedAlbum {
  name: string;
  artists: string;
  releaseDate: string;
  imageUrl: string;
  spotifyUrl: string;
  isrc: string;
  tracks: {
    name: string;
    artists: string;
    previewUrl?: string;
    isrc: string;
    trackUrl?: string;
  }[];
  streamingUrls?: {
    [platform: string]: string;
  };
}

/**
 * Component for displaying detailed information about a Spotify album
 * including tracks and links to other streaming platforms
 */
@Component({
  selector: 'app-spotify-detail',
  templateUrl: './spotify-detail.component.html',
  styleUrls: ['./spotify-detail.component.scss'],
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
export class SpotifyDetailComponent implements OnInit {
  detailedAlbum: DetailedAlbum | null = null;
  isLoading = false;
  showSpotifyCopyMessage = false;
  showPlatformCopyMessage: { [key: string]: boolean } = {};
  mainPlatforms = ['spotify', 'applemusic', 'deezer', 'soundcloud', 'youtubemusic']; // List of main streaming platforms, in order of preference
  showAllPlatforms = false;

  // Mapping of platform keys to display names
  platformDisplayNames: { [key: string]: string } = {
    spotify: 'Spotify',
    applemusic: 'Apple Music',
    youtubemusic: 'YouTube Music',
    youtube: 'YouTube',
    deezer: 'Deezer',
    soundcloud: 'SoundCloud',
    amazonmusic: 'Amazon Music',
    amazonstore: 'Amazon Store',
    itunes: 'iTunes',
    pandora: 'Pandora',
    napster: 'Napster',
    tidal: 'Tidal',
    yandex: 'Yandex'
  };

  constructor(
    private route: ActivatedRoute,
    private spotifyService: SpotifyService,
    private router: Router,
    private songlinkService: SonglinkService,
    private titleService: Title
  ) {}

  /**
   * Initializes the component by subscribing to route parameters
   * and loading album details when an albumId is present
   */
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const albumId = params.get('albumId');
      if (albumId) {
        this.loadAlbumDetails(albumId);
      }
    });

    this.titleService.setTitle('MetaMusicFinder - Loading Album Details'); // Set the default title of the page
  }

  /**
   * Loads album details from Spotify API
   * @param albumId The Spotify album ID
   */
  private loadAlbumDetails(albumId: string) {
    this.spotifyService.getAlbumDetails(albumId).subscribe(
      (albumDetails: any) => {
        // Populate detailedAlbum with album information
        this.detailedAlbum = {
          name: albumDetails.name,
          artists: albumDetails.artists.map((a: any) => a.name).join(', '),
          releaseDate: albumDetails.release_date,
          imageUrl: albumDetails.images[0]?.url || '',
          spotifyUrl: albumDetails.external_urls.spotify,
          isrc: '',
          tracks: []
        };

        // Set the page title with album details
        this.titleService.setTitle(`MetaMusicFinder - ${this.detailedAlbum.name} by ${this.detailedAlbum.artists}`);

        // Fetch track details for each track in the album
        const trackIds = albumDetails.tracks.items.map((track: any) => track.id);
        this.spotifyService.getTrackDetails(trackIds.join(',')).subscribe(
          (trackDetails: any) => {
            this.detailedAlbum!.tracks = trackDetails.tracks.map((track: any) => ({
              name: track.name,
              artists: track.artists.map((a: any) => a.name).join(', '),
              previewUrl: track.preview_url,
              isrc: track.external_ids?.isrc || '',
              trackUrl: track.external_urls?.spotify || ''
            }));
          },
          error => {
            console.error('Error loading track details', error);
            this.titleService.setTitle('MetaMusicFinder - Error Loading Tracks');
          }
        );
      },
      error => {
        console.error('Error loading album details', error);
        this.titleService.setTitle('MetaMusicFinder - Error Loading Album');
      }
    );
  }

  /**
   * Loads album information from Songlink API
   * @param url The Spotify album URL
   */
  loadAlbumInfo(url: string) {
    this.isLoading = true;
    this.songlinkService.getMatchingLinks(url, 'BE', false).subscribe(
      (response: any) => {
        this.processStreamingUrls(response);
        this.isLoading = false;
      },
      error => {
        console.error('Error loading album info', error);
        this.isLoading = false;
      }
    );
  }

  /**
   * Loads track information from Songlink API
   * @param url The Spotify track URL
   */
  loadTrackInfo(url: string | undefined) {
    if (!url) {
      console.error('Track URL is undefined');
      return;
    }

    this.isLoading = true;
    this.songlinkService.getMatchingLinks(url, 'BE', true).subscribe(
      (response: any) => {
        this.processStreamingUrls(response);
        this.isLoading = false;
      },
      error => {
        console.error('Error loading track info', error);
        this.isLoading = false;
      }
    );
  }

  /**
   * Processes the streaming URLs from the Songlink API response
   * @param response The Songlink API response
   */
  private processStreamingUrls(response: any) {
    if (response.linksByPlatform) {
      const streamingUrls: { [platform: string]: string } = {};
      for (const platform in response.linksByPlatform) {
        if (response.linksByPlatform.hasOwnProperty(platform)) {
          const link = response.linksByPlatform[platform];
          streamingUrls[platform] = link.url;
        }
      }
      this.detailedAlbum!.streamingUrls = streamingUrls;
    }
  }

  /**
   * Returns the appropriate icon class for a given platform
   * @param platform The streaming platform
   * @returns The CSS class for the platform icon
   */
  getIconClass(platform: string): string {
    switch (platform.toLowerCase()) {
      case 'spotify':
        return 'fab fa-spotify spotify';
      case 'applemusic':
        return 'fab fa-apple appleMusic';
      case 'youtubemusic':
        return 'fab fa-youtube youtubeMusic';
      case 'youtube':
        return 'fab fa-youtube youtube';
      case 'soundcloud':
        return 'fab fa-soundcloud soundcloud';
      case 'deezer':
        return 'fab fa-deezer deezer';
      case 'amazonmusic':
        return 'fab fa-amazon amazonMusic';
      default:
        return 'fas fa-music'; // Default icon
    }
  }

  /**
   * Getter for displayed platforms based on showAllPlatforms flag
   */
  get displayedPlatforms() {
    if (this.showAllPlatforms || !this.detailedAlbum?.streamingUrls) {
      return this.detailedAlbum?.streamingUrls || {};
    } else {
      return Object.entries(this.detailedAlbum.streamingUrls)
        .filter(([platform]) => this.mainPlatforms.includes(platform.toLowerCase()))
        .reduce((obj, [platform, url]) => {
          obj[platform] = url;
          return obj;
        }, {} as { [platform: string]: string });
    }
  }

  /**
   * Toggles the display of all platforms
   */
  toggleShowAllPlatforms() {
    this.showAllPlatforms = !this.showAllPlatforms;
  }

  /**
   * Copies the given text to clipboard and shows a temporary message
   * @param text The text to copy
   * @param platform Optional platform name for platform-specific messages
   */
  copyToClipboard(text: string, platform?: string) {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);

    if (platform) {
      this.showPlatformCopyMessage[platform] = true;
      setTimeout(() => {
        this.showPlatformCopyMessage[platform] = false;
      }, 2000);
    } else {
      this.showSpotifyCopyMessage = true;
      setTimeout(() => {
        this.showSpotifyCopyMessage = false;
      }, 2000);
    }
  }

  /**
   * Returns the display name for a given platform
   * @param platform The platform key
   * @returns The display name of the platform
   */
  getDisplayName(platform: string): string {
    return this.platformDisplayNames[platform.toLowerCase()] || platform;
  }

  /**
   * Navigates back to the search page
   */
  goBack() {
    this.router.navigate(['/search']);
  }

  saveUrlsToFile() {
    if (this.detailedAlbum && this.detailedAlbum.streamingUrls) {
      let content = `${this.detailedAlbum.name} by ${this.detailedAlbum.artists}\n\n`;
      content += `Streaming URLs\n`;
      content += `---------------\n\n`;
      
      for (const [platform, url] of Object.entries(this.detailedAlbum.streamingUrls)) {
        content += `${platform}  :  ${url}\n`;
      }
      content += `\nList generated with ♥ by MetaMusicFinder`;

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${this.detailedAlbum.name.replace(/\s+/g, '_')}_streaming_urls.txt`;
      link.click();
      window.URL.revokeObjectURL(url);
    }
  }
}