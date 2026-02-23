import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/**
 * Protects routes by allowing access only to users with a stored authentication token.
 * Redirects unauthenticated users to the login page before navigation completes.
 */
export const loginGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (token) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};