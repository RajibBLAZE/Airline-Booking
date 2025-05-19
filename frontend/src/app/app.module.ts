import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SearchFlightsComponent } from './flight/search-flights/search-flights.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { VerifyEmailComponent } from './auth/verify-email/verify-email.component';

import { AuthComponent } from './auth/auth/auth.component';
import { NavBarComponent } from './nav/nav-bar/nav-bar.component';


@NgModule({
  declarations: [
    AppComponent,
    SearchFlightsComponent,
    VerifyEmailComponent,
    AuthComponent,
    NavBarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
