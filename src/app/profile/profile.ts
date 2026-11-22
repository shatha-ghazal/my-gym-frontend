import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateJoined: string;
  membershipPlan: string | null;
  membershipStatus: string;
  membershipStartDate: string | null;
  membershipEndDate: string | null;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {

  profile: UserProfile | null = null;

  isAdmin = false;

  isLoading = true;
  isSaving = false;

  errorMessage = '';
  successMessage = '';

  private readonly apiUrl =
  `${environment.apiUrl}/Auth/profile`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
  this.checkUserRole();
  this.loadProfile();
}

  checkUserRole(): void {
    const token = this.authService.getToken();

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      const payload = JSON.parse(
        atob(
          token.split('.')[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/')
        )
      );

      const role =
        payload['role'] ||
        payload[
          'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
        ];

      this.isAdmin = role === 'Admin';

    } catch (error) {
      console.error('Invalid authentication token:', error);

      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  loadProfile(): void {
    const token = this.authService.getToken();

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.get<UserProfile>(
      this.apiUrl,
      { headers: this.getAuthHeaders() }
    ).subscribe({

      next: (response) => {
        this.profile = response;
        this.isLoading = false;
        this.cdr.markForCheck();
      },

      error: (error) => {
        console.error(
          'Failed to load profile:',
          error
        );

        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
          return;
        }

        this.errorMessage =
          'Unable to load your profile. Please try again.';

        this.isLoading = false;
        this.cdr.markForCheck();
      }

    });
  }

  saveProfile(): void {
    if (!this.profile || this.isSaving) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    const firstName = this.profile.firstName.trim();
    const lastName = this.profile.lastName.trim();
    const phoneNumber = this.profile.phoneNumber.trim();

    if (!firstName || !lastName) {
      this.errorMessage =
        'First name and last name are required.';
      return;
    }

    const token = this.authService.getToken();

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.isSaving = true;

    const updatedProfile = {
      firstName,
      lastName,
      phoneNumber
    };

    this.http.put<{ message: string }>(
      this.apiUrl,
      updatedProfile,
      { headers: this.getAuthHeaders() }
    ).subscribe({

      next: (response) => {
        if (this.profile) {
          this.profile.firstName = firstName;
          this.profile.lastName = lastName;
          this.profile.phoneNumber = phoneNumber;
        }

        this.successMessage =
          response.message || 'Profile updated successfully!';

        this.isSaving = false;
        this.cdr.markForCheck();
      },

      error: (error) => {
        console.error(
          'Failed to update profile:',
          error
        );

        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
          return;
        }

        this.errorMessage =
          error.error?.message ||
          'Unable to update your profile. Please try again.';

        this.isSaving = false;
        this.cdr.markForCheck();
      }

    });
  }
}
