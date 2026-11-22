import { Routes } from '@angular/router';

import { LoginComponent } from './login/login';
import { RegisterComponent } from './register/register';
import { Home } from './home/home';

import { ProfileComponent } from './profile/profile';
import { TrainersComponent } from './trainers/trainers';
import { MembershipsComponent } from './memberships/memberships';
import { MembershipCheckoutComponent } from './membership-checkout/membership-checkout';
import { AttendanceComponent } from './attendance/attendance';
import { AdminAttendanceComponent } from './admin-attendance/admin-attendance';
import { GymMembersComponent } from './gym-members/gym-members';
import { PaymentsComponent } from './payments/payments';
import { ReportsComponent } from './reports/reports';

import { adminGuard } from './guards/admin-guard';
import { membershipGuard } from './guards/membership-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: 'home', component: Home },
  { path: 'profile', component: ProfileComponent },
  { path: 'trainers', component: TrainersComponent },
  { path: 'memberships', component: MembershipsComponent },
  { path: 'membership-checkout', component: MembershipCheckoutComponent },

  {
    path: 'attendance',
    component: AttendanceComponent,
    canActivate: [membershipGuard]
  },

  {
    path: 'admin-attendance',
    component: AdminAttendanceComponent,
    canActivate: [adminGuard]
  },

  {
    path: 'gym-members',
    component: GymMembersComponent,
    canActivate: [adminGuard]
  },

  {
    path: 'payments',
    component: PaymentsComponent,
    canActivate: [adminGuard]
  },

  {
    path: 'reports',
    component: ReportsComponent,
    canActivate: [adminGuard]
  }
];
