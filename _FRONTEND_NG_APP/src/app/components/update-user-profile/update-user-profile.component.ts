import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, map, switchMap } from 'rxjs/operators';
import { tap } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/services/auth/authentication.service';
import { UsersService } from 'src/app/services/users/users.service';
import { IUser } from 'src/app/interfaces/user.interface';
import { environment } from 'src/environments/environment';
import { FileUpload } from 'src/app/core/interfaces/file-upload.interface';
import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { EMPTY, of } from 'rxjs';
import { Router } from '@angular/router';

const BASE_URL = `${environment.API_URL}`;
@Component({
  selector: 'app-update-user-profile',
  templateUrl: './update-user-profile.component.html',
  styleUrls: ['./update-user-profile.component.scss'],
})
export class UpdateUserProfileComponent implements OnInit {
  // subida de ficheros
  @ViewChild('fileUpload', { static: false }) fileUpload: ElementRef;

  file: FileUpload = {
    data: null,
    inProgress: false,
    progress: 0,
  };

  updateProfileForm: FormGroup;
  protected baseUrl: string = BASE_URL;
  // este userId es suceptible de cambiar, si el usuario, se loguea con otro usuario distinto al que ya hay
  userId: number | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private usersService: UsersService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.updateProfileForm = this.formBuilder.group({
      id: [{ value: null, disabled: true }, [Validators.required]],
      email: [{ value: null, disabled: true }, [Validators.required]],
      role: [{ value: null, disabled: true }, [Validators.required]],
      userName: [null, [Validators.required]],
      profileImage: [{ value: null, disabled: true }],
    });

    // this.authService.userId$;
    this.authService.userId$
      .pipe(
        switchMap((userId: number | null) => {
          if (userId !== null) {
            return this.usersService.getUserById(userId).pipe(
              tap((user: IUser) => {
                this.userId = userId;
                this.updateProfileForm.patchValue({
                  id: user.id,
                  email: user.email,
                  userName: user.userName,
                  profileImage: user.profileImage,
                });
              }),
            );
          } else {
            // Manejar el caso cuando userId es null, por ejemplo, podrías retornar un Observable vacío
            return EMPTY;
          }
        }),
      )
      .subscribe();
  }
  get profileImage() {
    return this.updateProfileForm.get('profileImage')?.value;
  }
  updateProfile() {
    this.usersService
      .updateUser(this.updateProfileForm.getRawValue())
      .pipe(
        tap((user: IUser) => {
          console.log('### User updated: ', user);
          // this.updateProfileForm.patchValue({
          //   id: user.id,
          //   email: user.email,
          //   userName: user.userName,
          //   profileImage: user.profileImage,
          // });
        }),
      )
      .subscribe();
  }

  onClickFile() {
    const fileInput = this.fileUpload.nativeElement;
    fileInput.click();
    fileInput.onchange = () => {
      this.file = {
        data: fileInput.files[0],
        inProgress: false,
        progress: 0,
      };
      this.fileUpload.nativeElement.value = '';
      this.uploadFile();
    };
  }
  uploadFile() {
    const formData = new FormData();
    formData.append('file', this.file.data);
    this.file.inProgress = true;

    this.usersService
      .uploadProfileImage(formData)
      .pipe(
        map((event) => {
          switch (event.type) {
            case HttpEventType.UploadProgress:
              this.file.progress = Math.round(
                (event.loaded * 100) / event.total,
              );
              break;
            case HttpEventType.Response:
              return event;
          }
        }),
        catchError((error: HttpErrorResponse) => {
          this.file.inProgress = false;
          return of('upload Failed');
        }),
      )
      .subscribe((event: any) => {
        if (typeof event === 'object') {
          this.updateProfileForm.patchValue({
            profileImage: event.body.profileImage,
          });
        }
      });
  }
}
