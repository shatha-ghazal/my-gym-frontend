import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

interface AdminAttendanceRecord {
  id: number;
  memberId: number;
  memberName: string;
  checkInTime: string;
  checkOutTime: string | null;
  status: string;
}

@Component({
  selector: 'app-admin-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-attendance.html',
  styleUrl: './admin-attendance.css'
})
export class AdminAttendanceComponent implements OnInit {

  private readonly apiUrl = `${environment.apiUrl}/attendance`;

  attendanceRecords: AdminAttendanceRecord[] = [];

  searchTerm = '';
  selectedDate = '';

  loading = true;
  errorMessage = '';

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

    this.http.get<AdminAttendanceRecord[]>(
      `${this.apiUrl}/all`,
      { headers: this.getHeaders() }
    ).subscribe({
      next: (records) => {
        this.attendanceRecords = records;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to load admin attendance:', error);

        this.errorMessage =
          error.status === 403
            ? 'Access denied. Administrator privileges are required.'
            : 'Unable to load attendance records.';

        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  get filteredAttendance(): AdminAttendanceRecord[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.attendanceRecords.filter(record => {
      const matchesName =
        record.memberName.toLowerCase().includes(search);

      const matchesDate =
        !this.selectedDate ||
        this.getLocalDate(record.checkInTime) === this.selectedDate;

      return matchesName && matchesDate;
    });
  }

  private getLocalDate(dateString: string): string {
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  get totalAttendance(): number {
    return this.attendanceRecords.length;
  }

  get currentlyCheckedIn(): number {
    return this.attendanceRecords.filter(
      record => record.checkOutTime === null
    ).length;
  }

  get todayAttendance(): number {
    const today = this.getLocalDate(new Date().toISOString());

    return this.attendanceRecords.filter(
      record => this.getLocalDate(record.checkInTime) === today
    ).length;
  }

  get monthlyAttendance(): number {
    const now = new Date();

    return this.attendanceRecords.filter(record => {
      const date = new Date(record.checkInTime);

      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      );
    }).length;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedDate = '';
  }
}
