import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { environment } from 'src/environments/environment';

const BASE_URL = environment.API_URL;

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private http: HttpClient) { }

  userExist(email: string): Observable<boolean> {
    return from(this.http.post<any>(`${BASE_URL}/api/users/exist`, {email: email.toLowerCase()}));
  }
}
