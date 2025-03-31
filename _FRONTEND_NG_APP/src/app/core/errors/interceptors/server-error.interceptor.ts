import { Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoggingService } from '../../services/logging.service';
import { NotificationService } from '../../services/notification.service';

@Injectable()
export class ServerErrorInterceptor implements HttpInterceptor {
  constructor(
    private logger: LoggingService,
    private notifier: NotificationService,
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
          errorMessage = `Message: ${error.error.message}`;
        } else {
          // return throwError(() => errorMessage);
          errorMessage = `Text: ${error.statusText}, Code: ${error.status}, message: ${error.message}`;
        }
        // de esto se encarga el `global handler error`
        // this.notifier.showError(errorMessage);
        // this.logger.logError(errorMessage);
        return throwError(() => errorMessage);
      }),
    );
  }
}
