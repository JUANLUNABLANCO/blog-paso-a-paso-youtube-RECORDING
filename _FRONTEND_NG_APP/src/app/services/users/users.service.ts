import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../../interfaces/user.interface';

import { Observable, from, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

import { UsersPaginated } from '../../interfaces/user.interface';

import { environment } from 'src/environments/environment';

const BASE_URL = environment.API_URL;

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private http: HttpClient) {}

  checkEmailExist(email: string): Observable<boolean> {
    // WARNING esto solo lo podrá hacer el ADMIN
    return from(
      this.http.post<any>(`${BASE_URL}/api/users/check-email-exists`, {
        email: email.toLowerCase(),
      }),
    );
  }
  checkUserNameExist(userName: string): Observable<boolean> {
    // WARNING esto lo solicita la app en el registro, para comprobarlo antes de enviar el formulario
    return from(
      this.http
        .post<any>(`${BASE_URL}/api/users/check-username-exists`, {
          userName: userName,
        })
        .pipe(map((response) => !!response)),
    );
  }
  getUsersPaginated(page = 1, limit = 10): Observable<UsersPaginated> {
    let params = new HttpParams();

    params = params.append('page', Number(page));
    params = params.append('limit', Number(limit));

    return this.http
      .get<UsersPaginated>(`${BASE_URL}/api/users`, { params })
      .pipe(
        map((usersPaginated: UsersPaginated) => {
          console.log('### usuarios paginados: ', usersPaginated);
          return usersPaginated;
        }),
      );
  }
  paginateByName(
    page: number,
    size: number,
    name: string,
  ): Observable<UsersPaginated> {
    let params = new HttpParams();

    params = params.append('page', String(page));
    params = params.append('limit', String(size));
    params = params.append('name', name);

    return this.http.get(`${BASE_URL}/api/users`, { params }).pipe(
      map((userData: UsersPaginated) => userData),
      catchError((err) => throwError(() => new Error(err))),
    );
  }
  getUserById(id: number): Observable<User> {
    return this.http.get(`${BASE_URL}/api/users/${id}`).pipe(
      map((user: User) => user),
      // catchError((err) => throwError(() => new Error(err))), // no hace falta, lo recoge el componente, en donde lo vamos a modificar gracias al interceptor
    ); // el motivo de este pipe(map()) es para convertir los datos que nos llegan de tipo any a User, directamente el http devuelve un Observable<any>
  }
  updateUser(user): Observable<User> {
    return this.http
      .put(`${BASE_URL}/api/users/${user.id}`, user)
      .pipe(map((user: User) => user));
  }
  uploadProfileImage(formData: FormData): Observable<any> {
    return this.http.post<FormData>(`${BASE_URL}/api/users/upload`, formData, {
      reportProgress: true,
      observe: 'events',
    });
  }
}
