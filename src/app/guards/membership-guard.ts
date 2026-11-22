import { inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

interface MembershipStatusResponse {
  isActive: boolean;
  isAdmin: boolean;
}

export const membershipGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);
  const http = inject(HttpClient);

  // Step 1: Check whether the user is logged in.
  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }

  // Step 2: Allow administrators.
  if (authService.isAdmin()) {
    return true;
  }

  // Step 3: Get the authentication token.
  const token = authService.getToken();

  if (!token) {
    return router.createUrlTree(['/login']);
  }

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  // Step 4: Check active membership with the backend.
  return http.get<MembershipStatusResponse>(
  `${environment.apiUrl}/membership-checkout/status`,
  { headers }
).pipe(

    map(response => {

      // Allow active gym members.
      if (response.isActive) {
        return true;
      }

      // Redirect regular users to the dashboard.
      return router.createUrlTree(['/home']);
    }),

    catchError(error => {

      console.error('Membership verification failed:', error);

      // Expired or invalid authentication.
      if (error.status === 401) {
        return of(router.createUrlTree(['/login']));
      }

      // Deny access when membership cannot be verified.
      return of(router.createUrlTree(['/home']));
    })
  );
};
