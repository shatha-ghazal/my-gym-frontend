
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {

  email = '';
  password = '';
  confirmPassword = '';

  errorMessage = '';
  successMessage = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  register(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email.trim() || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.loading = true;

    this.authService.register(this.email.trim(), this.password)
      .subscribe({
        next: (response) => {
          this.authService.saveToken(response.token);
          this.successMessage = 'Registration successful!';
          this.loading = false;

          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.errorMessage =
            error.error?.message || 'Registration failed. Please try again.';

          this.loading = false;
        }
      });
  }
}
