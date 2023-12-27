import { Injectable, NgZone } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(public snackBar: MatSnackBar, private zone: NgZone) {}

  showSuccess(message: string): void {
    // Had an issue with the snackbar being ran outside of angular's zone.
    this.zone.run(() => {
      this.snackBar.open(message, '', {
        duration: 5000,
        panelClass: ['bg-success'],
      });
    });
  }

  showError(message: string): void {
    this.zone.run(() => {
      this.snackBar.open(message, 'Close', {
        duration: 5000,
        panelClass: ['bg-error'],
      });
    });
  }
}
