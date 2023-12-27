import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../services/auth/authentication.service';
import { inject } from '@angular/core';

export const AuthGuard: CanActivateFn = (route, state) => {
  if (!inject(AuthenticationService).isAuthenticated()) {
    inject(Router).navigate(['/login']);
    return false;
  } else {
    return true;
  }
};
