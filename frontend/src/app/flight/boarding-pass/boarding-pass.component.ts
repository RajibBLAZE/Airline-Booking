import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
interface BoardingPass {
  name: string;
  booking: {
    flightNumber: number;
    from: string;
    to: string;
    departureTime: string;
    arrivalTime: string;
    duration: string,
    date: string;
    class: string;
    fareType: string;
    seat: string;
    gate: string;
    ticketNumber: string;
  };
}

@Component({
  selector: 'app-boarding-pass',
  templateUrl: './boarding-pass.component.html',
  styleUrls: ['./boarding-pass.component.css']
})
export class BoardingPassComponent implements OnInit {
  // to store array of boarding pass
  boardingPasses: BoardingPass[] = [];
  loading = true;
  errorMessage = '';

  constructor(private http: HttpClient, private route: ActivatedRoute) { }

  ngOnInit(): void {
    // Get userId from route params
    const userId = this.route.snapshot.paramMap.get('userId');
    if (userId) {
      //to laod the loader for 1.5 sec
      setTimeout(() =>{
        this.fetchBoardingPass(userId);
      },1500);
    } else {
      this.errorMessage = 'No user ID provided.';
      this.loading = false;
    }
  }
  fetchBoardingPass(userId: string) {
    this.http.get<BoardingPass[]>(`http://localhost:3005/api/flight/boarding-pass/${userId}`).subscribe({
      next: (data) => {
        this.boardingPasses = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to fetch boarding pass.';
        this.loading = false;
      }
    });
  }

}
