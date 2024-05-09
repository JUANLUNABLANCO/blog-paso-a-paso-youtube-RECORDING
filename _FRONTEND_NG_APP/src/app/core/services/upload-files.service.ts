import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  HttpClient,
  HttpRequest,
  HttpEvent,
  HttpParams,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UploadFilesService {
  baseUrl = environment.API_URL;
  api_users_upload = environment.API_USERS_UPLOAD; // /api/users/upload

  constructor(private http: HttpClient) {}

  upload(file: File): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();
    formData.append('file', file);

    const req = new HttpRequest(
      'POST',
      `${this.baseUrl}/${this.api_users_upload}`,
      formData,
      {
        reportProgress: true,
        responseType: 'json',
      },
    );
    return this.http.request(req);
  }
  // uploadProfileImage(formData: FormData): Observable<any> {
  //   return this.http.post<FormData>(`${BASE_URL}/api/users/upload`, formData, {
  //     reportProgress: true,
  //     observe: 'events',
  //   });
  // }

  // getFiles() {
  //   return this.http.get(`${this.baseUrl}/files`);
  // }

  // deleteFile(filename: string) {
  //   return this.http.get(`${this.baseUrl}/delete/${filename}`);
  // }
}
