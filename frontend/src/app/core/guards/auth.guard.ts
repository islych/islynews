import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  router.navigate(['/auth/login']);
  return false;
};

/** Keeps administrators inside their dedicated management workspace. */
export const adminWorkspaceGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.hasRole('ADMIN') ? router.createUrlTree(['/admin']) : true;
};

/** Keeps staff accounts inside the workspace that matches their role. */
export const readerPagesGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.hasRole('ADMIN')) return router.createUrlTree(['/admin']);
  if (auth.hasRole('JOURNALIST')) return router.createUrlTree(['/articles/my-articles']);
  return true;
};
