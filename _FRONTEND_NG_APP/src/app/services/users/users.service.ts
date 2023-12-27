import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { from, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { User, UsersPaginated } from '../../interfaces/user.interface';

const BASE_URL = environment.API_URL;

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private http: HttpClient) {}

  userExist(email: string): Observable<boolean> {
    return from(
      this.http.post<any>(`${BASE_URL}/api/users/exist`, {
        email: email.toLowerCase(),
      })
    );
  }
  findAll(page = 1, limit = 10): Observable<UsersPaginated> {
    let params = new HttpParams();

    params = params.append('page', Number(page));
    params = params.append('limit', Number(limit));

    return this.http
      .get<UsersPaginated>(`${BASE_URL}/api/users`, { params })
      .pipe(
        map((usersPaginated: UsersPaginated) => {
          console.log('### usuarios paginados: ', usersPaginated);
          return usersPaginated;
        })
      );
  }
  paginateByName(
    page: number,
    size: number,
    name: string
  ): Observable<UsersPaginated> {
    let params = new HttpParams();
    params = params.append('page', String(page));
    params = params.append('limit', String(size));
    params = params.append('name', name);

    return this.http
      .get<UsersPaginated>(`${BASE_URL}/api/users`, { params })
      .pipe(
        map((userData: UsersPaginated) => userData)
        // catchError((err) => throwError(() => new Error(err)))
      );
  }
  findOne(id: number): Observable<User> {
    console.log('## ID: ', id);
    return this.http
      .get(`${BASE_URL}/api/users/${id}`)
      .pipe(map((user: User) => user));
  }

  updateOne(user: User): Observable<User> {
    return this.http
      .put<User>(`${BASE_URL}/api/users/${user.id}`, user)
      .pipe(map((user: User) => user));
  }
}
