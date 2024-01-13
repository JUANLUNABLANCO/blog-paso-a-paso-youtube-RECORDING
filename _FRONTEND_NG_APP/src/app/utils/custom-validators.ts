import { AbstractControl, ValidationErrors } from '@angular/forms';
export class CustomValidators {
  static passwordsMatch(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      return { passwordsMatching: true };
    } else {
      return null;
    }
  }
}
