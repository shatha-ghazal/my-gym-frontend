import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

interface ReportsSummary {
  totalMembers: number;
  activeMemberships: number;
  totalPayments: number;
  totalRevenue: number;
  todayAttendance: number;
  monthlyAttendance: number;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reports.html',
  styleUrl: './reports.css'
})
export class ReportsComponent implements OnInit {

  private apiUrl = `${environment.apiUrl}/reports/summary`;

  totalMembers = 0;
  activeMemberships = 0;
  totalPayments = 0;
  totalRevenue = 0;
  todayAttendance = 0;
  monthlyAttendance = 0;

  loading = false;
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    const token = this.authService.getToken();

    if (!token) {
      this.errorMessage = 'Please log in to view reports.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.get<ReportsSummary>(
      this.apiUrl,
      { headers }
    ).subscribe({
      next: (data) => {
        this.totalMembers = data.totalMembers;
        this.activeMemberships = data.activeMemberships;
        this.totalPayments = data.totalPayments;
        this.totalRevenue = data.totalRevenue;
        this.todayAttendance = data.todayAttendance;
        this.monthlyAttendance = data.monthlyAttendance;

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Failed to load reports:', error);

        this.errorMessage =
          error.status === 403
            ? 'Only administrators can view reports.'
            : 'Unable to load reports from the server.';

        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
