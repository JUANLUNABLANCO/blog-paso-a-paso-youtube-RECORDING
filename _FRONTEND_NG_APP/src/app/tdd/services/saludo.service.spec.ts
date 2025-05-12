import { TestBed } from '@angular/core/testing';

import { SaludoService } from './saludo.service';

describe('SaludoService', () => {
  let service: SaludoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SaludoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('debería devolver un saludo personalizado', () => {
    const saludo = service.obtenerSaludo('Pedro');
    expect(saludo).toBe('Hola, Pedro!');
  });
  it('debería devolver un saludo personalizado', () => {
    const saludo = service.obtenerSaludo('Arturo');
    expect(saludo).toBe('Hola, Arturo!');
  });
});
