import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { Router, RouterLink } from '@angular/router';
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

@Component({
  selector: 'app-memberships',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './memberships.html',
  styleUrl: './memberships.css'
})
export class MembershipsComponent implements OnInit {

  plans: MembershipPlan[] = [];

  isAdmin = false;
  isLoading = true;
  isAdding = false;

  errorMessage = '';
  successMessage = '';

  newPlan = {
    name: '',
    description: '',
    price: 0,
    durationInMonths: 1,
    isActive: true
  };

  private readonly apiUrl =
  `${environment.apiUrl}/membershipplans`;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkUserRole();
    this.loadMembershipPlans();
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

  loadMembershipPlans(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<MembershipPlan[]>(this.apiUrl).subscribe({

      next: (response) => {
        const planOrder: Record<string, number> = {
          Basic: 1,
          Standard: 2,
          Premium: 3
        };

        this.plans = response
          .filter(plan => plan.isActive)
          .sort((a, b) =>
            (planOrder[a.name] ?? 99) -
            (planOrder[b.name] ?? 99)
          );

        this.isLoading = false;
        this.cdr.markForCheck();
      },

      error: (error) => {
        console.error(
          'Failed to load membership plans:',
          error
        );

        this.errorMessage =
          'Unable to load membership plans. Please try again.';

        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  subscribe(plan: MembershipPlan): void {
    if (this.isAdmin) {
      return;
    }

    this.router.navigate(['/membership-checkout'], {
      queryParams: {
        planId: plan.id
      }
    });
  }

  addMembershipPlan(): void {
    if (!this.isAdmin || this.isAdding) {
      return;
    }

    const token = this.authService.getToken();

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const plan = {
      name: this.newPlan.name.trim(),
      description: this.newPlan.description.trim(),
      price: Number(this.newPlan.price),
      durationInMonths: Number(this.newPlan.durationInMonths),
      isActive: true
    };

    if (
      !plan.name ||
      !Number.isFinite(plan.price) ||
      plan.price <= 0 ||
      !Number.isInteger(plan.durationInMonths) ||
      plan.durationInMonths <= 0
    ) {
      this.errorMessage =
        'Enter a plan name, a valid price, and a valid duration.';
      return;
    }

    this.isAdding = true;
    this.errorMessage = '';
    this.successMessage = '';

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.post<MembershipPlan>(
      this.apiUrl,
      plan,
      { headers }
    ).subscribe({

      next: () => {
        this.successMessage =
          'Membership plan added successfully!';

        this.newPlan = {
          name: '',
          description: '',
          price: 0,
          durationInMonths: 1,
          isActive: true
        };

        this.isAdding = false;
        this.loadMembershipPlans();
        this.cdr.markForCheck();
      },

      error: (error) => {
        console.error(
          'Failed to add membership plan:',
          error
        );

        this.errorMessage =
          error.status === 403
            ? 'Only administrators can add membership plans.'
            : 'Unable to add membership plan. Please try again.';

        this.isAdding = false;
        this.cdr.markForCheck();
      }
    });
  }
}
