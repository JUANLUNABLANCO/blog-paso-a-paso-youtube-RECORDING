import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../services/auth/authentication.service';
import { inject } from '@angular/core';

export const PreserveUserGuard: CanActivateFn = (route, state) => {
  const userIdFromUrl = Number(route.paramMap.get('id'));
  if (
    !userIdFromUrl ||
    !inject(AuthenticationService).userIsUser(userIdFromUrl)
  ) {
    inject(Router).navigate(['/login']);
    return false;
  } else {
    return true;
  }
};
