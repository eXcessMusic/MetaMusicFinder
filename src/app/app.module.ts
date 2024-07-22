import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, Title } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MusicSearchComponent } from './components/music-search/music-search.component';
import { SpotifyResultsComponent } from './components/spotify-results/spotify-results.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { SpotifyDetailComponent } from './components/spotify-detail/spotify-detail.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    MusicSearchComponent,
    SpotifyResultsComponent,
    SpotifyDetailComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule
  ],
  providers: [
    provideClientHydration(),
    provideHttpClient(withFetch()),
    Title
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
