import { Injectable } from '@angular/core';
import { AuthenticationService } from '../services/auth/authentication.service';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class PreserveUserGuard {
  constructor(
    private authService: AuthenticationService,
    private router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const userIdFromUrl = Number(route.paramMap.get('id'));
    if (userIdFromUrl && !this.authService.userIsUser(userIdFromUrl)) {
      this.router.navigate(['/login']);
      return false;
    } else {
      return true;
    }
  }
}
