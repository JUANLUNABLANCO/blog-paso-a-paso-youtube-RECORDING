import { Component } from '@angular/core';

@Component({
  selector: 'app-contador',
  templateUrl: './contador.component.html',
  styleUrls: ['./contador.component.scss'],
})
export class ContadorComponent {
  count = 0;

  increment() {
    this.count++;
  }
  isPositive() {
    return this.count > 0;
  }
  decrement() {
    if (this.isPositive()) this.count--;
  }
}
