import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, map, of, tap } from 'rxjs';

import { FileUpload } from '../../../core/interfaces/file-upload.interface';
import { IBlogEntry } from '../../../interfaces/blog-entries.interface';
import { BlogService } from '../../../services/blog/blog.service';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

const BASE_URL = `${environment.API_URL}`;
@Component({
  selector: 'app-create-blog-entry',
  templateUrl: './create-blog-entry.component.html',
  styleUrls: ['./create-blog-entry.component.scss'],
})
export class CreateBlogEntryComponent implements OnInit {
  @ViewChild('headerImageUpload', { static: false })
  headerImageUpload: ElementRef;

  file: FileUpload = {
    data: null,
    inProgress: false,
    progress: 0,
  };

  formBlogEntry: FormGroup;

  protected baseUrl: string = BASE_URL;
  constructor(
    private formBuilder: FormBuilder,
    private blogService: BlogService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.formBlogEntry = this.formBuilder.group({
      id: [{ value: null, disabled: true }],
      slug: [{ value: null, disabled: true }],
      title: [
        null,
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(150),
        ],
      ],
      description: [
        null,
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(500),
        ],
      ],
      body: [null, [Validators.required, Validators.minLength(5)]],
      headerImage: [null, [Validators.required]],
    });
  }
  createNewBlogEntry() {
    this.blogService
      .createNewBlogEntry(this.formBlogEntry.getRawValue())
      .pipe(
        tap((blogEntry: IBlogEntry) => {
          if (!blogEntry) {
            console.log('### blogEntry no creado');
            return;
          }
          console.log('### blogEntry Created: ', blogEntry);
          this.resetData();
          this.redirectToBlogEntries(blogEntry.id);
        }),
      )
      .subscribe();
  }
  private resetData() {
    this.formBlogEntry.reset();
    this.file = {
      data: null,
      inProgress: false,
      progress: 0,
    };
    this.headerImageUpload.nativeElement.value = '';
  }
  private redirectToBlogEntries(id: number) {
    this.router.navigate([`/blog-entries/${id}`]);
  }
  onClickFile(event: MouseEvent) {
    event.preventDefault();
    const fileInput = this.headerImageUpload.nativeElement;
    fileInput.click();
    console.log('#### fileSelecting ');
    fileInput.onchange = (event: any) => {
      if (event.target.files.length > 0) {
        console.log('#### fileSelected: ', fileInput.files[0]);
        const fileSelected = fileInput.files[0];
        this.file = {
          data: fileSelected,
          inProgress: false,
          progress: 0,
        };
      }
      this.headerImageUpload.nativeElement.value = '';
      this.uploadHeaderImage();
    };
  }
  uploadHeaderImage() {
    if (!this.file.data) {
      this.headerImageUpload.nativeElement.value = '';
      return;
    }
    const formData = new FormData();
    console.log('#### comprobando el file', this.file);
    formData.append('file', this.file.data);
    this.file.inProgress = true;

    this.blogService
      .uploadHeaderImage(formData)
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
          const fileName = event.body.headerImage;
          console.log('#### fileName: ', fileName);
          this.formBlogEntry.patchValue({
            headerImage: fileName,
          });
        }
      });
  }
}
