import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SaludoService {
  obtenerSaludo(name: string): string {
    return `Hola, ${name}!`;
  }
}
