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
  // WARNING esto es por si quieres realmente ver los errores que llegan desde el servidor
  getOriginalServerErrorMessage(error: HttpErrorResponse): string {
    console.log('#### server error message', error);
    return navigator.onLine
      ? `${error.statusText}, ${error.status}`
      : 'No Internet Connection';
  }
  getServerErrorMessage(error: HttpErrorResponse): string {
    console.log('#### server error message', error);
    return navigator.onLine
      ? `${error.error.statusCode}, ${error.error.message}`
      : 'No Internet Connection';
  }
}
