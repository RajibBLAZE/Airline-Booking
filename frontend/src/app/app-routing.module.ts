import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VerifyEmailComponent } from './auth/verify-email/verify-email.component';
import { SearchFlightsComponent } from './flight/search-flights/search-flights.component';
import { AuthComponent } from './auth/auth/auth.component';
import { BoardingPassComponent } from './flight/boarding-pass/boarding-pass.component';

const routes: Routes = [
  { path: '', redirectTo: '/flight', pathMatch: 'full' },
  { path: 'auth', component: AuthComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'flight', component: SearchFlightsComponent }, // protected route

  { path: 'boarding-pass/:userId', component: BoardingPassComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
