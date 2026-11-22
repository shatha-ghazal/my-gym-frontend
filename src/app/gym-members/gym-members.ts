
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

interface Member {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
}

interface Membership {
  id: number;
  memberId: number;
  membershipPlanId: number;
  startDate: string;
  endDate: string;
  status: string;
  membershipPlan: {
    id: number;
    name: string;
  } | null;
}

interface GymMemberRow {
  id: number;
  name: string;
  email: string;
  membership: string;
  status: string;
}

@Component({
  selector: 'app-gym-members',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './gym-members.html',
  styleUrl: './gym-members.css'
})
export class GymMembersComponent implements OnInit {

  members: GymMemberRow[] = [];

  isLoading = true;
  errorMessage = '';

  private readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers(): void {

    const token = this.authService.getToken();

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      members: this.http.get<Member[]>(
        `${this.apiUrl}/members`,
        { headers }
      ),
      memberships: this.http.get<Membership[]>(
        `${this.apiUrl}/memberships`,
        { headers }
      )
    }).subscribe({
      next: ({ members, memberships }) => {

        this.members = members.map(member => {

          const memberMemberships = memberships
            .filter(m => m.memberId === member.id)
            .sort((a, b) =>
              new Date(b.startDate).getTime() -
              new Date(a.startDate).getTime()
            );

          const latestMembership = memberMemberships[0];

          return {
            id: member.id,
            name: `${member.firstName} ${member.lastName}`,
            email: member.email,
            membership:
              latestMembership?.membershipPlan?.name ??
              'No Membership',
            status: latestMembership
              ? latestMembership.status
              : 'Not Subscribed'
          };

        });

        this.isLoading = false;
        this.cdr.markForCheck();
      },

      error: (error) => {

        console.error('Failed to load gym members:', error);

        if (error.status === 401 || error.status === 403) {
          this.errorMessage =
            'Access denied. Only administrators can view gym members.';
        } else {
          this.errorMessage =
            'Unable to load gym members. Please try again.';
        }

        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
