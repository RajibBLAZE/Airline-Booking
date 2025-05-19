import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VerifyEmailComponent } from './auth/verify-email/verify-email.component';
import { SearchFlightsComponent } from './flight/search-flights/search-flights.component';
import { AuthComponent } from './auth/auth/auth.component';

const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'flight', component: SearchFlightsComponent }, // protected route
  { path: '', redirectTo: '/flight', pathMatch: 'full' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
