import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthenticationService } from '../../services/auth/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  formLogin: FormGroup;
  userId!: number;

  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.formLogin = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      password: [
        null,
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(50),
        ],
      ],
    });

    this.authService.userId$
      .pipe(
        map((userId: number | null) => {
          if (userId) this.userId = userId;
        })
      )
      .subscribe();
  }

  get emailField() {
    return this.formLogin.get('email');
  }
  get passwordField() {
    return this.formLogin.get('password');
  }

  onSubmit(form: FormGroup) {
    if (this.formLogin.invalid) {
      return;
    }
    // TODO manejo de errores por consola, dentro del subscribe y uso del tap y redirección al perfil del usuario
    this.authService.login(this.formLogin.value).subscribe({
      next: (token) => {
        if (token) {
          const userId = this.authService.getBehaviorUserId();
          if (userId) this.userId = userId;
          this.router.navigate(['users', this.userId]);
        }
      },
    });
  }
}
