import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  getClientErrorMessage(error: Error): string {
    console.log('#### client error message', error);
    return error.message ? error.message : error.toString();
  }

  getServerErrorMessage(error: HttpErrorResponse): string {
    console.log('#### server error message', error.error);
    return navigator.onLine
      ? `${error.error.message}, ${error.error.statusCode}`
      : 'No Internet Connection';
  }
}
