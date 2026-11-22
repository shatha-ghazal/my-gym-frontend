import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

interface MembershipPlan {
  id: number;
  name: string;
  price: number;
  durationInMonths: number;
  description: string;
  isActive: boolean;
}

interface CheckoutResponse {
  message: string;
  membershipId: number;
  paymentId: number;
  isActive: boolean;
}

@Component({
  selector: 'app-membership-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './membership-checkout.html',
  styleUrl: './membership-checkout.css'
})
export class MembershipCheckoutComponent implements OnInit {

  selectedPlan: MembershipPlan | null = null;

  isLoading = true;
  isProcessing = false;
  paymentSuccessful = false;

  errorMessage = '';
  successMessage = '';

  private readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const planId = Number(
      this.route.snapshot.queryParamMap.get('planId')
    );

    if (!Number.isInteger(planId) || planId <= 0) {
      this.errorMessage = 'Invalid membership plan.';
      this.isLoading = false;
      return;
    }

    this.http.get<MembershipPlan[]>(
      `${this.apiUrl}/membershipplans`
    ).subscribe({

      next: (plans) => {

        this.selectedPlan =
          plans.find(plan =>
            plan.id === planId && plan.isActive
          ) ?? null;

        if (!this.selectedPlan) {
          this.errorMessage = 'Membership plan not found.';
        }

        this.isLoading = false;
        this.cdr.markForCheck();
      },

      error: () => {

        this.errorMessage = 'Unable to load membership plan.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  confirmPayment(): void {

    if (!this.selectedPlan || this.isProcessing || this.paymentSuccessful) {
      return;
    }

    const token = this.authService.getToken();

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.isProcessing = true;
    this.errorMessage = '';

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.post<CheckoutResponse>(
      `${this.apiUrl}/membership-checkout/confirm`,
      {
        membershipPlanId: this.selectedPlan.id
      },
      { headers }
    ).subscribe({

      next: (response) => {

        this.paymentSuccessful = response.isActive;
        this.successMessage = response.message;
        this.isProcessing = false;

        this.cdr.markForCheck();
      },

      error: (error) => {

        this.isProcessing = false;

        if (error.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
          return;
        }

        this.errorMessage =
          error.error?.message ||
          'Demo payment could not be completed.';

        this.cdr.markForCheck();
      }
    });
  }

  backToDashboard(): void {
    this.router.navigate(['/home']);
  }
}
