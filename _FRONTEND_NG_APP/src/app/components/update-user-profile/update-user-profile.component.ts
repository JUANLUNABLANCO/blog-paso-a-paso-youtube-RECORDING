import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { switchMap } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/services/auth/authentication.service';
import { UsersService } from 'src/app/services/users/users.service';
import { User } from 'src/app/interfaces/user.interface';

@Component({
  selector: 'app-update-user-profile',
  templateUrl: './update-user-profile.component.html',
  styleUrls: ['./update-user-profile.component.scss'],
})
export class UpdateUserProfileComponent implements OnInit {
  updateProfileForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private userService: UsersService
  ) {}

  ngOnInit(): void {
    this.updateProfileForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }, [Validators.required]],
      email: [{ value: null, disabled: true }, [Validators.required]],
      name: [{ value: null }, [Validators.required]],
      // TODO profileImage: [{ value: null }, [Validators.required]],
    });

    this.authService
      .getUserId()
      .pipe(
        switchMap((id: number) =>
          this.userService.findOne(id).pipe(
            tap((user: User) => {
              this.updateProfileForm.patchValue({
                id: user.id,
                email: user.email,
                name: user.name,
              });
            })
          )
        )
      )
      .subscribe();
  }

  updateProfile() {
    console.log(
      '### user form profile: ',
      this.updateProfileForm.getRawValue()
    );
    this.userService
      .updateOne(this.updateProfileForm.getRawValue())
      .pipe(tap((user: User) => console.log('### User updated: ', user)))
      .subscribe();
  }
}
