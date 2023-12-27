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
        // console.log('########## ERROR: ', error);
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
          errorMessage = `Message: ${error.error.message}`;
        } else {
          errorMessage = `Text: ${error.statusText}, Code: ${error.status}, message: ${error.message}`;
        }
        return throwError(() => errorMessage);
      })
    );
  }
}
