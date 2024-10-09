import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { SpotifyService } from './spotify-service.service';
import { SonglinkService } from './songlink.service';

@Injectable({
  providedIn: 'root'
})
export class ExternalSearchService {
  constructor(
    private http: HttpClient,
    private spotifyService: SpotifyService,
    private songlinkService: SonglinkService
  ) {}

  searchSong(query: string): Observable<any> {
    return this.spotifyService.searchAlbum(query).pipe(
      switchMap(spotifyResponse => {
        if (spotifyResponse && spotifyResponse.tracks && spotifyResponse.tracks.items.length > 0) {
          const track = spotifyResponse.tracks.items[0];
          const spotifyUrl = track.external_urls.spotify;
          
          return this.songlinkService.getMatchingLinks(spotifyUrl).pipe(
            map(songlinkResponse => {
              return {
                name: track.name,
                artist: track.artists.map((a: any) => a.name).join(', '),
                release_date: track.album.release_date,
                preview_url: track.preview_url,
                spotify_url: spotifyUrl,
                soundcloud_url: songlinkResponse.linksByPlatform?.soundcloud?.url || '',
                applemusic_url: songlinkResponse.linksByPlatform?.appleMusic?.url || '',
                youtube_url: songlinkResponse.linksByPlatform?.youtube?.url || '',
                deezer_url: songlinkResponse.linksByPlatform?.deezer?.url || ''
              };
            })
          );
        } else {
          throw new Error('No results found');
        }
      })
    );
  }
}