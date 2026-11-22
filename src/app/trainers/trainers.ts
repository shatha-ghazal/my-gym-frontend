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

interface Trainer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  specialization: string;
  isActive: boolean;
}

@Component({
  selector: 'app-trainers',
  standalone: true,
  imports: [
  CommonModule,
  FormsModule,
  RouterLink
  ],
  templateUrl: './trainers.html',
  styleUrl: './trainers.css'
})

export class TrainersComponent implements OnInit {

  trainers: Trainer[] = [];

  isAdmin = false;
  isLoading = true;
  errorMessage = '';
  isAdding = false;
  successMessage = '';

  newTrainer = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    specialization: '',
    isActive: true
  };

  private readonly apiUrl =
  `${environment.apiUrl}/trainers`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkUserRole();
    this.loadTrainers();
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

      console.log('Current user role:', role);
      console.log('Is Admin:', this.isAdmin);

    } catch (error) {
      console.error('Invalid authentication token:', error);

      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  loadTrainers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<Trainer[]>(this.apiUrl).subscribe({

      next: (response) => {
        this.trainers = response;
        this.isLoading = false;
        this.cdr.markForCheck();
      },

      error: (error) => {
        console.error('Failed to load trainers:', error);

        this.errorMessage =
          'Unable to load trainers. Please try again.';

        this.isLoading = false;
        this.cdr.markForCheck();
      }

    });
  }

  addTrainer(): void {
    if (!this.isAdmin || this.isAdding) {
      return;
    }

    const token = this.authService.getToken();

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const trainer = {
      firstName: this.newTrainer.firstName.trim(),
      lastName: this.newTrainer.lastName.trim(),
      email: this.newTrainer.email.trim(),
      phoneNumber: this.newTrainer.phoneNumber.trim(),
      specialization: this.newTrainer.specialization.trim(),
      isActive: this.newTrainer.isActive
    };

    if (
      !trainer.firstName ||
      !trainer.lastName ||
      !trainer.email ||
      !trainer.specialization
    ) {
      this.errorMessage =
        'Please complete all required trainer fields.';
      return;
    }

    this.isAdding = true;
    this.errorMessage = '';
    this.successMessage = '';

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.post<Trainer>(
      this.apiUrl,
      trainer,
      { headers }
    ).subscribe({

      next: () => {
        this.successMessage =
          'Trainer added successfully!';

        this.newTrainer = {
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          specialization: '',
          isActive: true
        };

        this.isAdding = false;
        this.loadTrainers();
        this.cdr.markForCheck();
      },

      error: (error) => {
        console.error('Failed to add trainer:', error);

        this.errorMessage =
          error.status === 403
            ? 'Only administrators can add trainers.'
            : 'Unable to add trainer. Please try again.';

        this.isAdding = false;
        this.cdr.markForCheck();
      }

    });
  }
}
