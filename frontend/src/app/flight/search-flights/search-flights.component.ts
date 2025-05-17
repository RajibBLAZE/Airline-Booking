import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

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

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
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
      });
  }

  bookFlight(flight: any) {
    const passengers = this.form.value.passengers;
    const body = {
      user_id: "222",
      flight_id: flight.id,
      passengers: passengers,
      travel_class: this.form.value.classType,
      round_trip: false,
      return_date: null,
    };

    this.http.post('http://localhost:3005/api/flight/book', body).subscribe({
      next: () => alert('Flight booked successfully!'),
      error: (err) => {
        console.error('Booking failed:', err);
        alert('Booking failed');
      },
    });
  }
}
