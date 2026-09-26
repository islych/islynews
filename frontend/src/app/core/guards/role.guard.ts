import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/user.model';

export const roleGuard = (allowedRoles: Role[]): CanActivateFn => {
  return (_route: ActivatedRouteSnapshot) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn()) {
      router.navigate(['/auth/login']);
      return false;
    }

    if (auth.hasRole(...allowedRoles)) return true;

    if (auth.hasRole('ADMIN')) router.navigate(['/admin']);
    else if (auth.hasRole('JOURNALIST')) router.navigate(['/articles/my-articles']);
    else router.navigate(['/']);
    return false;
  };
};
