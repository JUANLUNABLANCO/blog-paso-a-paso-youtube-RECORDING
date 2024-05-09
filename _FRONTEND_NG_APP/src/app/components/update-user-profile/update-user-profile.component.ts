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
      profileImage: [null],
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
                  role: user.role,
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
    if (this.updateProfileForm.valid) {
      const formToUpdate = { ...this.updateProfileForm.getRawValue() };
      delete formToUpdate.profileImage; // la imagen no la quiere el backend
      this.usersService
        .updateUser(formToUpdate)
        .pipe(
          tap((user: IUser) => {
            console.log('### User updated: ', user);
          }),
        )
        .subscribe();
    }
  }

  onClickFile() {
    const fileInput = this.fileUpload.nativeElement;
    fileInput.click();
    fileInput.onchange = (event: any) => {
      if (event.target.files.length > 0) {
        const fileSelected = fileInput.files[0];
        this.file = {
          data: fileSelected,
          inProgress: false,
          progress: 0,
        };
        this.fileUpload.nativeElement.value = '';
        this.uploadFile();
      }
    };
  }
  uploadFile() {
    if (!this.file.data) {
      this.fileUpload.nativeElement.value = '';
      return;
    }
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
          const fileName = event.body.profileImage;
          this.updateProfileForm.patchValue({
            profileImage: fileName,
          });
        }
      });
  }
}
