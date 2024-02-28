import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';
import { AuthenticationService } from './services/auth/authentication.service';
import { map } from 'rxjs';
import { UserNavigationEntries } from './core/interfaces/user-navigation-entries.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'frontend';
  isLogged = false;
  private userId: number | null = null;

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
    this.authService.isLogged$.subscribe((isLogged) => {
      // Actualizar la navegación del usuario y la autenticación
      this.updateUserNavigationEntries(isLogged);
      this.updateUserAuthentication(isLogged);
      // Si el usuario está autenticado, redirigir al perfil
      if (isLogged) {
        this.authService.fetchAndSetUserIdFromToken().subscribe((userId) => {
          if (userId) {
            this.userId = userId;
            this.router.navigate(['/users', userId]);
          }
        });
      }
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
      this.isLogged = false;
      this.clearUserData();
      this.router.navigate(['/login']); // Redirigir al usuario a una ruta predeterminada después de cerrar sesión
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

  // DOIT refactorized to use the service and control the error
  navigateTo(value: string) {
    if (value !== 'logout') {
      this.router.navigate([value]);
    } else {
      console.log('### logout ! iniciado', this.userId);
      this.authService.advancedLogout(this.userId).subscribe();
    }
  }
}
