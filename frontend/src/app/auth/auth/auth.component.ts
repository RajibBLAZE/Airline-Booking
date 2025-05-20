import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit {
  authForm: FormGroup;
  code: string = '';
  message: string = '';
  error: string = '';
  isLogin = true;
  showSuccessGif: boolean = false;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.authForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      phone: ['', Validators.required],
      isStudent: [false],
    });
  }
  toggleMode() {
    this.isLogin = !this.isLogin;
  }
  ngOnInit(): void {}
  submit() {
    const data = this.authForm.value;
    const email = this.authForm.value.email;
     // check if isLogin or not 
    if (this.isLogin) {
      this.authService.login(data).subscribe({
        next: (res: any) => {
          this.message = 'Login Successful!';
          // token is saved in localstorage
          this.authService.saveToken(res.token);
          this.showSuccessGif = true;
          setTimeout(() =>{
            this.router.navigate(['/flight']);
          },1500)
        },
        error: (err) => {
          this.showSuccessGif = false;
          this.error = err.error.message || 'Login failed';
        },
      });
    } else {
      this.authService.register(data).subscribe({
        next: () => {
          this.message = 'Verification code sent to your email.';
          localStorage.setItem('email', email); // Save email for code verification
          this.router.navigate(['/verify-email']);
        },
        error: (err) => {
          this.error = err.error.message || 'Error sending code';
        },
      });
    }
  }
}
