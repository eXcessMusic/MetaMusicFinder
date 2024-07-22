import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MusicSearchComponent } from './components/music-search/music-search.component';
import { SpotifyDetailComponent } from './components/spotify-detail/spotify-detail.component';

const routes: Routes = [
  { path: 'search', component: MusicSearchComponent },
  { path: 'detail/:albumId', component: SpotifyDetailComponent },
  { path: '', redirectTo: '/search', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
