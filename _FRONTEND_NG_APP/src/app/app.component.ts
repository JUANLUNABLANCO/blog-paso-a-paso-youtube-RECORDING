import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthenticationService } from './services/auth/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'FRONTEND_NG_APP';

  entries = [
    {
      title: 'Register',
      description: 'Register a new user',
      link: 'register',
    },
    {
      title: 'Login',
      description: 'Login as a user',
      link: 'login',
    },
    {
      title: 'Logout',
      description: 'Logout as a user',
      link: 'logout',
    },
    {
      title: 'Update Profile',
      description: 'Update your profile',
      link: 'update-profile',
    },
  ];
  constructor(
    private router: Router,
    private authService: AuthenticationService
  ) {
    console.log('environment CONTROL: ', environment.CONTROL);
    console.log('environment API_URL: ', environment.API_URL);
  }

  navigateTo(value: string) {
    if (value !== 'logout') {
      this.router.navigate(['../', value]);
    } else {
      this.authService.logout();
      this.router.navigate(['']);
    }
  }
}
