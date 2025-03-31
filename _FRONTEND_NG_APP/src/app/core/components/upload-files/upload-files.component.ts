import { Component } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { HttpEventType, HttpResponse } from '@angular/common/http';

import { UploadFilesService } from '../../services/upload-files.service';

@Component({
  selector: 'app-upload-files',
  templateUrl: './upload-files.component.html',
  styleUrls: ['./upload-files.component.scss'],
})
export class UploadFilesComponent {
  selectedFiles: FileList;
  //Es el array que contiene los items para mostrar el progreso de subida de cada archivo
  progressInfo = [];
  message = '';
  imageName = '';

  fileInfos: Observable<any>;

  constructor(private uploadFilesService: UploadFilesService) {}

  selectFiles(event) {
    this.progressInfo = [];
    event.target.files.length == 1
      ? (this.imageName = event.target.files[0].name)
      : (this.imageName = event.target.files.length + ' archivos');
    this.selectedFiles = event.target.files;
  }

  upload(index, file) {
    this.progressInfo[index] = { value: 0, fileName: file.name };

    this.uploadFilesService.upload(file).subscribe(
      (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.progressInfo[index].value = Math.round(
            (100 * event.loaded) / event.total,
          );
        } else if (event instanceof HttpResponse) {
          this.fileInfos = EMPTY; // this.uploadFilesService.getFiles();
        }
      },
      (err) => {
        this.progressInfo[index].value = 0;
        this.message = 'No se puede subir el archivo ' + file.name;
      },
    );
  }

  uploadFiles() {
    this.message = '';
    for (let i = 0; i < this.selectedFiles.length; i++) {
      this.upload(i, this.selectedFiles[i]);
    }
  }

  // deleteFile(filename: string) {
  //   this.uploadFilesService.deleteFile(filename).subscribe((res) => {
  //     this.message = res['message'];
  //     this.fileInfos = this.uploadFilesService.getFiles();
  //   });
  // }
}
