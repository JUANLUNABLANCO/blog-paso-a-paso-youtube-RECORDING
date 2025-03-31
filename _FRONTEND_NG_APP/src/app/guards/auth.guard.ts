import { Injectable } from '@angular/core';
import { AuthenticationService } from '../services/auth/authentication.service';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(
    private authService: AuthenticationService,
    private router: Router,
  ) {}

  canActivate(): boolean | UrlTree {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    } else {
      return true;
    }
  }
}

// ### Versiones más modernas

// import { CanActivateFn } from '@angular/router';
// import { inject } from '@angular/core';
// import { AuthenticationService } from '../services/auth/authentication.service';
// import { Router, UrlTree } from '@angular/router';

// export const authGuard: CanActivateFn = (route, state) => {
//   if (!inject(AuthenticationService).isAuthenticated()) {
//     inject(Router).navigate(['/login']);
//     return false;
//   } else {
//     return true;
//   }
// };
