import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment.dev';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'FRONTEND_NG_APP';

  entries = [
    {
      title: 'Register',
      description: 'Register a new user',
      link: 'register'
    },
    {
      title: 'Login',
      description: 'Login as a user',
      link: 'login'
    }
  ];
  constructor(private router: Router) { 
    console.log('environment CONTROL: ', environment.CONTROL);
    console.log('environment API_URL: ', environment.API_URL);
  }

  navigateTo(value: string) {
    this.router.navigate(['../', value])
  }
}
