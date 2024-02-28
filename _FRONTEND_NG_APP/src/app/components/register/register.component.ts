import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { AuthenticationService } from '../../services/auth/authentication.service';
import { UsersService } from '../../services/users/users.service';
import { Observable, from, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { CustomValidators } from '../../utils/custom-validators';
import { LoggingService } from '../../core/services/logging.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  formRegister: FormGroup;
  userId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private usersService: UsersService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.formRegister = this.fb.group(
      {
        userName: [
          null,
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(20),
          ],
        ],
        email: [
          null,
          [Validators.required, Validators.email],
          [this.emailExist.bind(this)],
        ],
        password: [
          null,
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(50),
          ],
        ],
        confirmPassword: [
          null,
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(50),
          ],
        ],
      },
      {
        validators: CustomValidators.passwordsMatch,
      },
    );
  }

  get userNameField() {
    return this.formRegister.get('userName');
  }
  get emailField() {
    return this.formRegister.get('email');
  }
  get passwordField() {
    return this.formRegister.get('password');
  }
  get confirmPasswordField() {
    return this.formRegister.get('confirmPassword');
  }

  onChange($event: any) {
    console.log('### Value Change: ', $event.target.value);
    if (this.emailField) this.emailField.updateValueAndValidity();
  }

  emailExist(control: FormControl): Observable<ValidationErrors | null> {
    return from(this.usersService.checkEmailExist(control.value)).pipe(
      map((userExist) => {
        if (userExist) {
          return { emailIsUsed: true };
        } else {
          return null;
        }
      }),
    );
  }
  userNameExist(control: FormControl): Observable<ValidationErrors | null> {
    if (control.value) {
      LoggingService.consoleLog(`#### check: ${control.value}`);
      return from(this.usersService.checkUserNameExist(control.value)).pipe(
        map((userExist) => {
          if (userExist) {
            return { userNameIsUsed: true };
          } else {
            return null;
          }
        }),
      );
    }
    return of(null);
  }
  onSubmit(form: FormGroup) {
    if (this.formRegister.invalid) {
      return;
    }

    LoggingService.consoleLog(
      `LoggingService: formRegister ${JSON.stringify(form.value)}`,
    );

    this.authService
      .registerAndLogin(form.value)
      .pipe(
        tap(({ user, access_token }) => {
          console.log(access_token);
          if (user && access_token) {
            this.authService.setBehaviorUserId(user.id!);
          }
        }),
        switchMap(({ user, access_token }) => {
          if (user && access_token) {
            return this.authService.userId$.pipe(take(1));
          }
          return of(null);
        }),
        tap((userId) => {
          if (userId !== null) {
            this.userId = userId;
            this.router.navigate(['users', this.userId]);
          }
        }),
      )
      .subscribe();
  }
}
