import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EMPTY, of, switchMap } from 'rxjs';
import { catchError, filter, map, tap } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/services/auth/authentication.service';
import { UsersService } from 'src/app/services/users/users.service';
import { User } from 'src/app/interfaces/user.interface';
import { environment } from 'src/environments/environment';
import { FileUpload } from '../../interfaces/file-upload.interface';
import { HttpErrorResponse, HttpEventType } from '@angular/common/http';

const BASE_URL = `${environment.API_URL}`;
@Component({
  selector: 'app-update-user-profile',
  templateUrl: './update-user-profile.component.html',
  styleUrls: ['./update-user-profile.component.scss'],
})
export class UpdateUserProfileComponent implements OnInit {
  updateProfileForm: FormGroup;
  @ViewChild('fileUpload', { static: false }) fileUpload: ElementRef;

  file: FileUpload = {
    data: null,
    inProgress: false,
    progress: 0,
  };
  userId: number | null = null;

  protected baseUrl: string = BASE_URL;

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
      role: [{ value: null, disabled: true }, [Validators.required]],
      profileImage: [{ value: null, disabled: true }],
    });

    this.authService.userId$
      .pipe(
        switchMap((userId: number | null) => {
          if (userId !== null) {
            return this.userService.findOne(userId).pipe(
              tap((user: User) => {
                this.userId = userId;
                this.updateProfileForm.patchValue({
                  id: user.id,
                  email: user.email,
                  name: user.name,
                  profileImage: user.profileImage,
                });
              })
            );
          } else {
            // Manejar el caso cuando userId es null, por ejemplo, podrías retornar un Observable vacío
            return EMPTY;
          }
        })
      )
      .subscribe();
  }

  updateProfile() {
    this.userService
      .updateOne(this.updateProfileForm.getRawValue())
      .pipe(tap((user: User) => console.log('### User updated: ', user)))
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
    this.userService
      .uploadProfileImage(formData)
      .pipe(
        map((event) => {
          switch (event.type) {
            case HttpEventType.UploadProgress:
              this.file.progress = Math.round(
                (event.loaded * 100) / event.total
              );
              break;
            case HttpEventType.Response:
              return event;
          }
        }),
        catchError((error: HttpErrorResponse) => {
          this.file.inProgress = false;
          return of('upload Failed');
        })
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
