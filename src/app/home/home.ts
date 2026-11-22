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

interface MembershipStatusResponse {
  isActive: boolean;
  isAdmin: boolean;
  membership?: {
    id: number;
    membershipPlanId: number;
    startDate: string;
    endDate: string;
  } | null;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  isAdmin = false;
  isGymMember = false;
  isRegularUser = false;

  isLoadingMembership = true;
  membershipError = '';

  private readonly membershipStatusUrl =
  `${environment.apiUrl}/membership-checkout/status`;

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    if (!this.authService.isLoggedIn()) {
      this.authService.logout();
      this.router.navigate(['/login']);
      return;
    }

    this.isAdmin = this.authService.isAdmin();

    if (this.isAdmin) {
      this.isGymMember = false;
      this.isRegularUser = false;
      this.isLoadingMembership = false;
      return;
    }

    const token = this.authService.getToken();

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.get<MembershipStatusResponse>(
      this.membershipStatusUrl,
      { headers }
    ).subscribe({

      next: (response) => {

        this.isGymMember = response.isActive;
        this.isRegularUser = !response.isActive;

        this.isLoadingMembership = false;
        this.membershipError = '';

        console.log('Gym member status:', this.isGymMember);

        // Notify Angular to refresh the dashboard.
        this.cdr.markForCheck();
      },

      error: (error) => {

        console.error('Failed to load membership status:', error);

        this.isGymMember = false;
        this.isRegularUser = false;
        this.isLoadingMembership = false;

        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
          return;
        }

        this.membershipError =
          'Unable to verify membership status. Please try again.';

        this.cdr.markForCheck();
      }

    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
