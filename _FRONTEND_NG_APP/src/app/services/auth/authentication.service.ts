import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  JWT,
  JWTDecoded,
  LoginForm,
  RegisterForm,
} from '../../interfaces/auth.interface';
import { environment } from '../../../environments/environment';
import { of, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';

const BASE_URL = environment.API_URL;
export const JWT_NAME = 'access_token';
@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(private http: HttpClient, private jwtHelper: JwtHelperService) {}

  login(loginForm: LoginForm) {
    // TODO if(loginForm.valid) { ...
    // TODO controla los posibles errores después del map con catchError( throwError(() => new Error(err)))
    return this.http
      .post<any>(`${BASE_URL}/api/users/login`, {
        email: loginForm.email,
        password: loginForm.password,
      })
      .pipe(
        map((token) => {
          localStorage.setItem(JWT_NAME, token.access_token);
          console.log('# AuthenticationService.login: ', token);
          return token;
        })
      );
  }
  register(registerForm: RegisterForm) {
    // TODO if(registerForm.valid) { ...
    // TODO controla los posibles errores después del map con catchError( throwError(() => new Error(err)))
    return this.http
      .post<any>(`${BASE_URL}/api/users`, registerForm)
      .pipe(map((user) => user));
  }
  isAuthenticated(): boolean {
    const token = localStorage.getItem(JWT_NAME);
    // TODO comprobar el id del usuario en el token
    return !this.jwtHelper.isTokenExpired(token);
  }
  getUserId(): Observable<number> {
    return of(localStorage.getItem(JWT_NAME)).pipe(
      switchMap((jwt: any) =>
        of(this.jwtHelper.decodeToken(jwt)).pipe(
          tap((decoded: null | JWTDecoded) =>
            console.log('# AuthenticationService.getUserId: ', decoded)
          ),
          map((decoded: null | JWTDecoded) => {
            return decoded ? decoded.user.id : 0;
          })
        )
      )
    );
  }
  logout() {
    // TODO si tuviéramos un backend, yo personalmente, avisaría al backend a través de una petición http GET para que ajuste sus cosas y resetee al usuario de la request, el jwt, etc. por seguridad.
    localStorage.removeItem(JWT_NAME);
  }
}
