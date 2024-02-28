import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  getClientErrorMessage(error: Error): string {
    return error.message ? error.message : error.toString();
  }
  // WARNING esto es por si quieres realmente ver los errores que llegan desde el servidor, que no deben de llegar, deben ser capados
  getOriginalServerErrorMessage(error: HttpErrorResponse): string {
    console.log('#### server error message', error);
    return navigator.onLine
      ? `${error.statusText}, ${error.status}`
      : 'No Internet Connection';
  }
  getServerErrorMessage(error: HttpErrorResponse): string {
    return navigator.onLine
      ? `${error.error.statusCode}, ${error.error.message}`
      : 'No Internet Connection';
  }
}
