import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html'
})
export class VerifyEmailComponent {

  code = '';
  message = '';
  error = '';

  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router) {
  }

  verify() {
    // get the email stored in the localstorage
    const email = localStorage.getItem('email');
    if (!email) {
      this.error = 'No email found for verification.';
      return;
    }
    // calling the verifycode service
    this.authService.verifyCode (email, this.code).subscribe({
      next: () => {
        this.message = 'Email verified successfully. Please log in.';
        localStorage.removeItem('email');
        setTimeout(() => this.router.navigate(['/auth']), 2000);
      },
      error: (err) => {
        this.error = err.error.message || 'Verification failed.';
      }
    });
  }
}
