import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  JWT,
  JWTDecoded,
  LoginForm,
  RegisterForm,
} from '../../interfaces/auth.interface';
import { environment } from '../../../environments/environment';
import { of, Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User, UserRole } from 'src/app/interfaces/user.interface';

const BASE_URL = environment.API_URL;
export const JWT_NAME = 'access_token';
@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  // user is logged (authenticated)
  private isLoggedSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  isLogged$: Observable<boolean> = this.isLoggedSubject.asObservable();

  // id del usuario
  private userIdSubject: BehaviorSubject<number | null> = new BehaviorSubject<
    number | null
  >(null);
  userId$: Observable<number | null> = this.userIdSubject.asObservable();

  constructor(private http: HttpClient, private jwtHelper: JwtHelperService) {}

  // register(registerForm: RegisterForm) {
  //   // TODO if(registerForm.valid) { ...
  //   // TODO controla los posibles errores después del map con catchError( throwError(() => new Error(err)))
  //   return this.http
  //     .post<any>(`${BASE_URL}/api/users`, registerForm)
  //     .pipe(map((user) => user));
  // }
  registerAndLogin(
    user: RegisterForm
  ): Observable<{ user: User; access_token: string }> {
    return this.http.post<any>(`${BASE_URL}/api/users`, user).pipe(
      tap(({ user, access_token }) => {
        // if (user && access_token) {
        console.log('#### user', user);
        this.loginAfterRegistration(access_token);
        return { user, access_token };
        // } else {
        // return throwError(() => 'Error en el registro');
        // } // el manejador de errores se encarga
      })
    );
  }

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
          if (token) {
            localStorage.setItem(JWT_NAME, token.access_token);
            console.log('# AuthenticationService.login: ', token);
            // obtener su id y subscribirse a los cambios
            this.fetchAndSetUserIdFromToken().subscribe();
            // comunicar estado del usuario autenticado
            this.isLoggedSubject.next(true);
            return token;
          } else {
            console.log('#### Ocurrió un error');
          }
        })
      );
  }
  private loginAfterRegistration(token: string): void {
    if (token) {
      // anotar el token en el localstorage
      localStorage.setItem(JWT_NAME, token);
      // setear el id en el behavior subject
      this.fetchAndSetUserIdFromToken().subscribe();
      // comunicar el estado del suario autenticado
      this.isLoggedSubject.next(true);
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !this.jwtHelper.isTokenExpired(token);
  }
  userIsAdmin(): boolean {
    if (!this.isAuthenticated()) return false;
    const token = this.getToken();
    if (token) {
      return this.getUserRoleFromToken(token) === UserRole.ADMIN ? true : false;
    }
    return false;
  }
  userIsUser(userIdFromParams: number): boolean {
    if (!userIdFromParams || !this.isAuthenticated()) return false;
    const token = this.getToken();
    if (token) {
      const idFromToken = this.getUserIdFromToken(token);
      if (idFromToken) {
        return userIdFromParams === idFromToken ? true : false;
      }
    }
    return false;
  }
  fetchAndSetUserIdFromToken(): Observable<number | null> {
    if (this.isAuthenticated()) {
      const token = this.getToken();
      if (token) {
        const userId = this.getUserIdFromToken(token);
        this.updateUserId(token);
        return of(userId);
      } else {
        this.updateUserId(null);
        return of(null);
      }
    } else {
      this.updateUserId(null);
      return of(null);
    }
  }
  advancedLogout(): Observable<any> {
    return this.http
      .post<User>(
        `${BASE_URL}/api/users/logout`,
        {},
        { withCredentials: true } // esto es enviando el token en la petición
      )
      .pipe(
        tap((message) => {
          this.logout();
          console.log('# AuthService.logout: ', message);
          return message;
        })
      );
  }
  private logout() {
    // TODO si tuviéramos un backend, yo personalmente, avisaría al backend a través de una petición http GET para que ajuste sus cosas y resetee al usuario de la request, el jwt, etc. por seguridad.
    localStorage.removeItem(JWT_NAME);
    // comunicar el estado del usuario no autenticado
    this.isLoggedSubject.next(false);
    // destruir el id
    this.setBehaviorUserId(null);
  }
  setBehaviorUserId(userId: number | null): void {
    this.userIdSubject.next(userId);
  }
  getBehaviorUserId(): number | null {
    return this.userIdSubject.getValue();
  }
  private getToken(): string | null {
    return localStorage.getItem(JWT_NAME);
  }
  private getUserRoleFromToken(jwt: string): string | null {
    try {
      const decoded = this.jwtHelper.decodeToken(jwt);
      return decoded?.user?.role || null;
    } catch (error) {
      console.log('Error decoding JWT: ', error);
      return null;
    }
  }
  private getUserIdFromToken(jwt: string): number | null {
    try {
      const decoded = this.jwtHelper.decodeToken(jwt);
      return decoded?.user?.id || null;
    } catch (error) {
      return null;
    }
  }
  private updateUserId(token: string | null): void {
    const userId = token ? this.getUserIdFromToken(token) : null;
    this.setBehaviorUserId(userId);
  }
}
