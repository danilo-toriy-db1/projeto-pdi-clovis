import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { UrlInvalida } from './url-invalida';

describe('UrlInvalida', () => {
  let fixture: ComponentFixture<UrlInvalida>;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [UrlInvalida],
      providers: [provideRouter([])],
    });
    fixture = TestBed.createComponent(UrlInvalida);
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture.detectChanges();
  });

  function campoId(): HTMLInputElement {
    return fixture.nativeElement.querySelector('#campo-id');
  }

  function formulario(): HTMLFormElement {
    return fixture.nativeElement.querySelector('.url-invalida__formulario');
  }

  it('deve exibir instruções e o campo de input, sem exibir dados de nenhuma pessoa', () => {
    expect(fixture.nativeElement.textContent).toContain('URL inválida');
    expect(campoId()).not.toBeNull();
  });

  it('deve navegar para /landing-page/{id} ao digitar um id válido e confirmar', () => {
    campoId().value = '0';
    campoId().dispatchEvent(new Event('input'));
    formulario().dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/landing-page/0');
  });

  it('não deve navegar e deve focar o campo com borda vermelha quando o id é inválido', () => {
    formulario().dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(router.navigateByUrl).not.toHaveBeenCalled();
    expect(campoId().classList.contains('campo-invalido')).toBe(true);
  });
});
