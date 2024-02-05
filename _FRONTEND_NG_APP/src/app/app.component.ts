import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthenticationService } from './services/auth/authentication.service';
import { UserNavigationEntries } from './core/interfaces/user-navigation-entries.interface';
import { map } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'FRONTEND_NG_APP';
  isLogged = false;
  private userId: number | null = null;

  userNavigationEntries: UserNavigationEntries[] = [
    {
      name: 'login',
      link: 'login',
    },
    {
      name: 'Register',
      link: 'register',
    },
  ];

  constructor(
    private router: Router,
    private authService: AuthenticationService
  ) {
    console.log('environment CONTROL: ', environment.CONTROL);
    console.log('environment API_URL: ', environment.API_URL);
  }

  ngOnInit(): void {
    this.authService.userId$
      .pipe(
        map((userId: number | null) => {
          this.userId = userId;
          this.updateUserId(userId);
        })
      )
      .subscribe();
    this.authService.isLogged$.subscribe((isLogged) => {
      this.updateUserNavigationEntries(isLogged);
      this.updateUserAuthentication(isLogged);
    });
  }
  private updateUserId(userId: number | null) {
    if (this.authService.isAuthenticated()) {
      const profileEntry = this.userNavigationEntries.find(
        (entry) => entry.name === 'Profile'
      );
      if (profileEntry) {
        profileEntry.link = userId ? `users/${userId}` : ``;
      }
    }
  }
  private updateUserNavigationEntries(isLogged: boolean) {
    if (isLogged) {
      this.userNavigationEntries = [
        {
          name: 'Logout',
          link: 'logout',
          description: 'This will log you out of the application.',
        },
        {
          name: 'Profile',
          link: `users/${this.userId}`,
        },
        {
          name: 'Update Profile',
          link: 'update-profile',
        },
      ];
      console.log('#### menu tras el login: ', this.userNavigationEntries);
    } else {
      this.userNavigationEntries = [
        {
          name: 'Login',
          link: 'login',
        },
        {
          name: 'Register',
          link: 'register',
        },
      ];
    }
  }
  private updateUserAuthentication(isLogged: boolean): void {
    if (!isLogged) {
      this.isLogged = false;
      this.clearUserData();
      this.router.navigate(['/login']);
    } else {
      this.isLogged = true;
    }
  }
  private clearUserData(): void {
    this.updateUserId(null);
  }
  userIsAdmin(): boolean {
    return this.authService.userIsAdmin();
  }
  navigateTo(value: string) {
    if (value !== 'logout') {
      this.router.navigate([value]);
    } else {
      this.authService.advancedLogout();
    }
  }
}
