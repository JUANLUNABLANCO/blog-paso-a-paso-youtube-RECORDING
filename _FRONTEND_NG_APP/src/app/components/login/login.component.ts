import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from '../../services/auth/authentication.service';
import { map, take, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoggingService } from '../../core/services/logging.service';
// TODO @URLS

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  formLogin: FormGroup;
  userId!: number;
  userIdSubscription: Subscription | undefined;

  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private router: Router,
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
    // WARNING ¿De verdad queremos subscribirnos al que hay en ese momento al entrar al login?
    // eso impedirá que otro usuario pueda loguearse mientras estamos logueados, lo que impide cambiar de usuario
    // prueba las dos formas
    // Suscribirse al userId$
    // this.userIdSubscription = this.authService.userId$
    //   .pipe(
    //     map((userId: number | null) => {
    //       if (userId !== null) {
    //         console.log('#### Login #### userId$: ', userId);
    //         this.userId = userId;
    //       }
    //     }),
    //   )
    //   .subscribe();
  }
  // # getters
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
    // DOIT refactorized this code to use the service and control the error
    this.authService
      .login(form.value)
      .pipe(
        tap((token) => {
          if (token) {
            LoggingService.consoleLog(`## token: ${token}`);
            // Suscribirse al userId$
            this.userIdSubscription = this.authService.userId$
              .pipe(
                take(1),
                tap((userId: number | null) => {
                  if (userId !== null) {
                    this.userId = userId;
                    this.router.navigate(['users', this.userId]);
                  }
                }),
              )
              .subscribe();
          }
        }),
      )
      .subscribe();
  }

  ngOnDestroy() {
    // Desuscribirse para evitar fugas de memoria
    if (this.userIdSubscription) {
      this.userIdSubscription.unsubscribe();
    }
  }
}
