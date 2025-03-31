import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoggingService {
  logError(message: string) {
    // Send errors to server here
    LoggingService.consoleLog('LoggingService - ERR: ' + message);
  }
  logSuccess(message: string) {
    // Send success to server here
    LoggingService.consoleLog('LoggingService - SUCCESS: ' + message);
  }
  public static consoleLog(message: string) {
    if (environment.CONTROL.mode !== 'prod') {
      // WARNING este console.log() es el único que no debes tocar, debes dejarlo como está
      console.log('LoggingService - Log: ' + message);
      // WARNING ##########################################################################
    }
  }
}
