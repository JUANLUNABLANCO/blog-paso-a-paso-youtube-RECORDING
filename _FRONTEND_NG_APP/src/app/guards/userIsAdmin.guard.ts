import { Injectable } from '@angular/core';
import { AuthenticationService } from '../services/auth/authentication.service';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard {
  constructor(
    private authService: AuthenticationService,
    private router: Router,
  ) {}

  canActivate(): boolean | UrlTree {
    if (!this.authService.userIsAdmin()) {
      this.router.navigate(['/login']);
      return false;
    } else {
      return true;
    }
  }
}
