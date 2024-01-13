import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../services/auth/authentication.service';
import { inject } from '@angular/core';

export const UserGuard: CanActivateFn = (route, state) => {
  if (
    !inject(AuthenticationService).userIsUser(Number(route.paramMap.get('id')))
  ) {
    inject(Router).navigate(['/login']);
    return false;
  } else {
    return true;
  }
};
