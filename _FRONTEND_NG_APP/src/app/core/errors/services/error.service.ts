import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  getClientErrorMessage(error: Error): string {
    return error.message ? error.message : error.toString();
  }

  getServerErrorMessage(error: HttpErrorResponse): string {
    return navigator.onLine ? error.message : 'No Internet Connection';
  }
}
