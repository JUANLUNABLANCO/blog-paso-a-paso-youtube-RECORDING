import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';

import { AuthenticationService } from '../../services/auth/authentication.service';
import { UsersService } from 'src/app/services/users/users.service';
import { User } from '../../interfaces/user.interface';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { CustomValidators } from '../../utils/custom-validators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  formRegister: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private userService: UsersService,
    private router: Router
  ) {}

  ngOnInit() {
    this.formRegister = this.fb.group(
      {
        name: [
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
          [this.userExist.bind(this)],
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
      }
    );
  }

  get nameField() {
    return this.formRegister.get('name');
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

  userExist(control: FormControl): Observable<ValidationErrors | null> {
    return from(this.userService.userExist(control.value)).pipe(
      map((userExist) => {
        if (userExist) {
          return { emailIsUsed: true };
        } else {
          return null;
        }
      })
    );
  }
  onSubmit(form: FormGroup) {
    if (this.formRegister.invalid) {
      this.formRegister.markAllAsTouched();
      return;
    }
    this.authService
      .registerAndLogin({
        name: form.value.name,
        email: 'pollo01@gmail.com',
        password: form.value.password,
      })
      .pipe(
        map(({ user, access_token }) => {
          if (user && access_token) {
            console.log('## resp: ', user, access_token);
            this.router.navigate([`/users/${user.id}`]);
          }
        })
      )
      .subscribe();
  }
}
