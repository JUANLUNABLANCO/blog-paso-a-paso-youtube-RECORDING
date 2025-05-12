import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContadorComponent } from './contador.component';

describe('ContadoºrComponent', () => {
  let component: ContadorComponent;
  let fixture: ComponentFixture<ContadorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ContadorComponent],
    });
    fixture = TestBed.createComponent(ContadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('debería iniciar en 0', () => {
    const component = new ContadorComponent();
    expect(component.count).toBe(0);
  });
  it('debería incrementar en 1 al ejecutar increment()', () => {
    const component = new ContadorComponent();
    component.increment();
    expect(component.count).toBe(1);
  });
  it('debería incrementar en 2 al ejecutar increment() dos veces', () => {
    const component = new ContadorComponent();
    component.increment();
    component.increment();
    expect(component.count).toBe(2);
  });
  // añadimos más funcionalidades, más tests
  it('debería decrementar en 1 al ejecutar decrement()', () => {
    const component = new ContadorComponent();
    component.increment();
    component.increment(); // ahora vale 2
    component.decrement(); // debe valer 1
    expect(component.count).toBe(1);
  });
  // prueba límite
  it('no debe de crecer por debajo de 0', () => {
    const component = new ContadorComponent();
    component.decrement();
    expect(component.count).toBe(0);
  });

  it('debe incrementar el contador al hacer clic en el botón incrementar', () => {
    const boton =
      fixture.debugElement.nativeElement.querySelector('button#incrementar');
    boton.click();
    fixture.detectChanges(); // Actualiza el DOM después del clic
    expect(component.count).toBe(1);
  });
  it('debe decrementar el contador al hacer clic en el botón decrementar', () => {
    const boton =
      fixture.debugElement.nativeElement.querySelector('button#decrementar');
    boton.click();
    fixture.detectChanges(); // Actualiza el DOM después del clic
    expect(component.count).toBe(0);
  });
  it('debe decrementar el contador de 2 a 1,al hacer clic en el botón decrementar', () => {
    const boton1 =
      fixture.debugElement.nativeElement.querySelector('button#incrementar');
    boton1.click();
    boton1.click(); // el valor sería 2
    const boton2 =
      fixture.debugElement.nativeElement.querySelector('button#decrementar');
    boton2.click();
    fixture.detectChanges(); // Actualiza el DOM después del clic
    expect(component.count).toBe(1);
  });
});
