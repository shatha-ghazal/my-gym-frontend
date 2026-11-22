
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  email = '';
  password = '';

  errorMessage = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(): void {
    this.errorMessage = '';

    if (!this.email.trim() || !this.password) {
      this.errorMessage = 'Please enter your email and password.';
      return;
    }

    this.loading = true;

    this.authService.login(this.email.trim(), this.password)
      .subscribe({
        next: (response) => {
          this.authService.saveToken(response.token);
          this.loading = false;

          this.router.navigate(['/home']);
        },
        error: (error) => {
          this.errorMessage =
            error.error?.message || 'Invalid email or password.';

          this.loading = false;
        }
      });
  }
}
