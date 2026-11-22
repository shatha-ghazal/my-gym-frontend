
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

interface PaymentMember {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface Payment {
  id: number;
  memberId: number;
  member: PaymentMember | null;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  status: string;
  transactionReference: string;
}

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payments.html',
  styleUrl: './payments.css'
})
export class PaymentsComponent implements OnInit {

  payments: Payment[] = [];

  isLoading = true;
  errorMessage = '';

  private readonly apiUrl =
  `${environment.apiUrl}/payments`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkAdminAndLoadPayments();
  }

  checkAdminAndLoadPayments(): void {

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

      if (role !== 'Admin') {
        this.router.navigate(['/home']);
        return;
      }

      this.loadPayments(token);

    } catch (error) {
      console.error('Invalid authentication token:', error);

      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  loadPayments(token: string): void {

    this.isLoading = true;
    this.errorMessage = '';

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.get<Payment[]>(
      this.apiUrl,
      { headers }
    ).subscribe({

      next: (response) => {

        this.payments = response.sort(
          (a, b) =>
            new Date(b.paymentDate).getTime() -
            new Date(a.paymentDate).getTime()
        );

        this.isLoading = false;
        this.cdr.markForCheck();
      },

      error: (error) => {

        console.error('Failed to load payments:', error);

        if (error.status === 401 || error.status === 403) {
          this.errorMessage =
            'Access denied. Only administrators can view payments.';
        } else {
          this.errorMessage =
            'Unable to load payments. Please try again.';
        }

        this.isLoading = false;
        this.cdr.markForCheck();
      }

    });
  }

  getMemberName(payment: Payment): string {

    if (!payment.member) {
      return 'Unknown Member';
    }

    return (
      payment.member.firstName +
      ' ' +
      payment.member.lastName
    ).trim();
  }

}
