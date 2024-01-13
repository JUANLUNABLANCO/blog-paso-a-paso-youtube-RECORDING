import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable()
export class ServerErrorInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log('########## ERROR type: ', typeof error);
        let errorMessage: any;
        if (error.error instanceof ErrorEvent) {
          errorMessage = `Message: ${error.error.message}`;
          return throwError(() => errorMessage);
        } else {
          return throwError(() => error);
        }
      })
    );
  }
}
