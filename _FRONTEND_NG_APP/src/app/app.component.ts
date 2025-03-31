import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';
import { AuthenticationService } from './services/auth/authentication.service';
import { Subject, takeUntil } from 'rxjs';
import { UserNavigationEntries } from './core/interfaces/user-navigation-entries.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'frontend';
  isLogged = false;
  private userId: number | null = null;
  private destroy$ = new Subject<void>();

  userNavigationEntries: UserNavigationEntries[] = [
    {
      name: 'Login',
      link: 'login',
    },
    {
      name: 'Register',
      link: 'register',
    },
  ];

  constructor(
    private router: Router,
    private authService: AuthenticationService,
  ) {
    console.log('Enviroment Control: ', environment.CONTROL);
    console.log('Enviroment API_URL: ', environment.API_URL);
  }

  ngOnInit(): void {
    this.authService.isLogged$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (isLogged) => {
        this.updateUserNavigationEntries(isLogged);
        this.updateUserAuthentication(isLogged);
        // Si el usuario está autenticado, suscribirse al ID del usuario
        if (isLogged) {
          this.authService.userId$.pipe(takeUntil(this.destroy$)).subscribe({
            next: (userId) => {
              this.userId = userId;
              if (userId) {
                this.updateUserId(userId);
                // this.router.navigate(['/users', userId]);
              }
            },
            error: (error) => {
              console.error('Error en la suscripción userId$', error);
            },
          });
        }
      },
      error: (error) => {
        console.error('Error en la suscripción isLogged$', error);
      },
    });
  }
  private updateUserId(userId: number | null): void {
    // this.userNavigationEntries[3].link = userId ? `users/${userId}` : '';
    if (this.authService.isAuthenticated()) {
      const profileEntry = this.userNavigationEntries.find(
        (entry) => entry.name === 'Profile',
      );
      if (profileEntry) {
        profileEntry.link = userId ? `users/${userId}` : '';
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
        {
          name: 'New Blog Entry',
          link: 'create-blog-entry',
        },
      ];
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
      this.clearUserData();
    } else {
      this.isLogged = isLogged;
      this.updateUserId(this.userId);
    }
  }

  private clearUserData(): void {
    this.updateUserId(null);
  }
  userIsAdmin(): boolean {
    return this.authService.userIsAdmin();
  }

  // DOIT refactorized to use the service and control the error
  navigateTo(value: string) {
    if (value !== 'logout') {
      this.router.navigate([value]);
    } else {
      console.log('### logout ! iniciado', this.userId);
      this.authService
        .advancedLogout(this.userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('Logout completado');
          },
          error: (error) => {
            console.error('Error en el logout', error);
          },
          complete: () => {
            console.info('Advenced Logout complete');
          },
        });
    }
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
