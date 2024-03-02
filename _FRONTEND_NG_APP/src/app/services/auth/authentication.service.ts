import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { LoginForm, RegisterForm } from '../../interfaces/auth.interface';
import { JwtHelperService } from '@auth0/angular-jwt';
import { User, UserRole } from 'src/app/interfaces/user.interface';

import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

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

  constructor(
    private http: HttpClient,
    private jwtHelper: JwtHelperService,
    private router: Router,
  ) {
    this.initializeAuthentication();
  }
  private initializeAuthentication(): void {
    this.fetchAndSetUserIdFromToken().subscribe((userId) => {
      if (userId !== null) {
        console.log('el usuario está autenticado: ', userId);
        this.isLoggedSubject.next(true);
      } else {
        console.log('el usuario no está autenticado', userId);
        this.isLoggedSubject.next(false);
        this.cleanLocalStorage();
      }
    });
  }
  // TODO comprobar si inicialmente existe un token en el localStorage, si es así asumirlo como login, deberás implemnetar el OnInit
  // login tras el registro
  registerAndLogin(
    user: RegisterForm,
  ): Observable<{ user: User; access_token: string }> {
    console.log('### REGISTER AND LOGIN: ', user);
    return this.http.post<any>(`${BASE_URL}/api/users`, user).pipe(
      tap(({ user, access_token }) => {
        // Lógica de registro exitoso
        console.log('#### user', user);
        this.loginAfterRegistration(access_token); // Autenticar al usuario después del registro
        return { user, access_token };
      }),
    );
  }
  login(loginForm: LoginForm) {
    // TODO cors desde el backend y api url en environment
    console.log('login form: ', loginForm);
    return this.http
      .post<any>(`${BASE_URL}/api/users/login`, {
        email: loginForm.email,
        password: loginForm.password,
      })
      .pipe(
        map((token) => {
          localStorage.setItem(JWT_NAME, token.access_token);
          // obtener su id y subscribirse a los cambios
          this.fetchAndSetUserIdFromToken().subscribe();
          // comunicar estado del usuario autenticado
          this.isLoggedSubject.next(true);
          return token;
        }),
      );
  }
  private loginAfterRegistration(token): void {
    // console.log('#### loginAfterRegistration', token);
    localStorage.setItem(JWT_NAME, token);
    // obtener su id y subscribirse a los cambios
    this.fetchAndSetUserIdFromToken().subscribe();
    // comunicar estado del usuario autenticado
    this.isLoggedSubject.next(true);
  }
  private cleanLocalStorage(): void {
    localStorage.removeItem(JWT_NAME);
  }
  isAuthenticated(): boolean {
    // podrías setear el id o el isLogged aquí ¿es necesario?, ya se encargan login, logout y getUserId
    const token = this.getToken();
    return !this.jwtHelper.isTokenExpired(token);
  }
  userIsAdmin(): any {
    // or boolean?
    if (!this.isAuthenticated()) return false;
    const token = this.getToken();
    if (token) {
      return this.getUserRoleFromToken(token) === UserRole.ADMIN ? true : false;
    }
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
  advancedLogout(userId: number | null): Observable<any> {
    if (userId) {
      console.log('### advancedLogout(), userId: ', userId);
      return this.http.get(`${BASE_URL}/api/users/logout/${userId}`).pipe(
        tap((message) => {
          console.log('## LOGOUT:', message);
          this.logout();
          console.log('# AuthService.logout: ', message);
          return message;
        }),
      );
    } else {
      return of('No hay usuario Logueado');
    }
  }
  logout() {
    // cualquier lógica necesaria de logout, reseteo de variables, subjectBehavior, etc
    // TODO si tuviéramos un backend, yo personalmente, avisaría al backend a través de una petición http GET para que ajuste sus cosas y resetee al usuario de la request, el jwt, etc. por seguridad.
    localStorage.removeItem(JWT_NAME);
    // comunicar estado del usuario autenticado
    this.isLoggedSubject.next(false);
    // destruir el id
    this.setBehaviorUserId(null);
    // devolverlo al '/'
    this.router.navigate(['/']);
  }
  // para manejo del bahavior Subject $userId
  setBehaviorUserId(userId: number | null): void {
    this.userIdSubject.next(userId);
  }
  getBehaviorUserId(): number | null {
    return this.userIdSubject.getValue();
  }
  private getToken(): string | null {
    return localStorage.getItem(JWT_NAME);
  }
  // 2. Obtener id a través del token
  private getUserIdFromToken(jwt: string): number | null {
    try {
      const decoded = this.jwtHelper.decodeToken(jwt);
      return decoded?.user?.id || null;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }
  private getUserRoleFromToken(jwt: string): string {
    try {
      const decoded = this.jwtHelper.decodeToken(jwt);
      return decoded?.user?.role || null;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }
  // 3. actualizar el id del usuario
  private updateUserId(token: string | null): void {
    const userId = token ? this.getUserIdFromToken(token) : null;
    this.setBehaviorUserId(userId);
  }
}
