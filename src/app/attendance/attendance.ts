import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

interface AttendanceRecord {
  id: number;
  checkInTime: string;
  checkOutTime: string | null;
  status: string;
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './attendance.html',
   styleUrl: './attendance.css'
})
export class AttendanceComponent implements OnInit {

  private apiUrl = `${environment.apiUrl}/attendance`;

  attendanceRecords: AttendanceRecord[] = [];

  loading = true;
  processing = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAttendance();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();

    return new HttpHeaders({
      Authorization: `Bearer ${token ?? ''}`
    });
  }

  loadAttendance(): void {
    this.loading = true;
    this.errorMessage = '';

    this.http.get<AttendanceRecord[]>(
      `${this.apiUrl}/my`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (records) => {
        this.attendanceRecords = records;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to load attendance:', error);
        this.errorMessage = 'Unable to load attendance records.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  checkIn(): void {
    if (this.processing) return;

    this.processing = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.post<{ message: string }>(
      `${this.apiUrl}/check-in`,
      {},
      { headers: this.getHeaders() }
    ).subscribe({
      next: (response) => {
        this.processing = false;
        this.successMessage = response.message;
        this.loadAttendance();
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.processing = false;
        this.errorMessage =
          error.error?.message || 'Check-in failed.';
        this.cdr.markForCheck();
      }
    });
  }

  checkOut(): void {
    if (this.processing) return;

    this.processing = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.post<{ message: string }>(
      `${this.apiUrl}/check-out`,
      {},
      { headers: this.getHeaders() }
    ).subscribe({
      next: (response) => {
        this.processing = false;
        this.successMessage = response.message;
        this.loadAttendance();
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.processing = false;
        this.errorMessage =
          error.error?.message || 'Check-out failed.';
        this.cdr.markForCheck();
      }
    });
  }

  get isCheckedIn(): boolean {
    return this.attendanceRecords.some(
      record => record.checkOutTime === null
    );
  }
}
