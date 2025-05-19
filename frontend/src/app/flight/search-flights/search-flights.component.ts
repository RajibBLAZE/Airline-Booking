import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-search-flights',
  templateUrl: './search-flights.component.html',
  styleUrls: ['./search-flights.component.css'],
})
export class SearchFlightsComponent implements OnInit {
  cities: any[] = [];
  form: FormGroup;
  submitted = false;
  flights: any[] = [];
  showFilters: boolean = false;
  showSuccessGif: boolean = true;
  loading: boolean = false;


  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      from: ['', Validators.required],
      to: ['', Validators.required],
      date: ['', Validators.required],
      classType: ['economy', Validators.required],
      fareType: ['regular'],
      airline: [''],
      minPrice: [0],
      maxPrice: [10000],
      timeSlot: [''],
      passengers: [1, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit() {

    this.http
      .get<any[]>('http://localhost:3005/api/flight/cities')
      .subscribe((data) => (this.cities = data));
  }

  onSearch() {
    this.submitted = true;
    if (this.form.invalid) return;

    this.http
      .post<any[]>('http://localhost:3005/api/flight/search', this.form.value)
      .subscribe((res) => {
        this.flights = res;
        this.showFilters = true;
      });
  }

  bookFlight(flight: any) {
  const token = this.authService.getToken();
  if (token) {
    const userId = this.authService.getUserIdFromToken();

    if (!userId) {
      alert('You must be logged in to book a flight.');
      return;
    }

    this.loading = true; // Show loader

    const passengers = this.form.value.passengers;
    const body = {
      user_id: userId,
      flight_id: flight.id,
      passengers: passengers,
      travel_class: this.form.value.classType,
      round_trip: false,
      return_date: null,
    };

    this.http.post('http://localhost:3005/api/flight/book', body).subscribe({
      next: () => {
        this.loading = false; // Hide loader
        alert('Flight booked successfully!');
      },
      error: (err) => {
        this.loading = false; // Hide loader
        console.error('Booking failed:', err);
        alert('Booking failed');
      },
    });
  } else {
    this.router.navigate(['/auth']);
  }
}

}
