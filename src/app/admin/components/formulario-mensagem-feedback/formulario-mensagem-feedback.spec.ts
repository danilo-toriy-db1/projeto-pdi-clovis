import { ComponentFixture, TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { FormularioMensagemFeedback } from './formulario-mensagem-feedback';

describe('FormularioMensagemFeedback', () => {
  let fixture: ComponentFixture<FormularioMensagemFeedback>;
  let componente: FormularioMensagemFeedback;

  function criarComponente(): void {
    TestBed.configureTestingModule({ imports: [FormularioMensagemFeedback] });
    fixture = TestBed.createComponent(FormularioMensagemFeedback);
    componente = fixture.componentInstance;
    fixture.detectChanges();
  }

  function campoMensagem(): HTMLTextAreaElement {
    return fixture.nativeElement.querySelector('#feedback-mensagem');
  }

  function botaoEnviar(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button[type="submit"]');
  }

  function botaoCancelar(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button[type="button"]');
  }

  it('deve emitir enviar com a mensagem digitada', () => {
    criarComponente();
    const spy = jest.fn();
    componente.enviar.subscribe(spy);

    campoMensagem().value = 'Seria ótimo ter um modo de alto contraste.';
    campoMensagem().dispatchEvent(new Event('input'));
    fixture.detectChanges();
    botaoEnviar().click();

    expect(spy).toHaveBeenCalledWith('Seria ótimo ter um modo de alto contraste.');
  });

  it('não deve emitir enviar e deve focar o campo quando a mensagem estiver vazia', () => {
    criarComponente();
    const spy = jest.fn();
    componente.enviar.subscribe(spy);

    botaoEnviar().click();
    fixture.detectChanges();

    expect(spy).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(campoMensagem());
    expect(campoMensagem().classList.contains('campo-invalido')).toBe(true);
    expect(fixture.nativeElement.textContent).toContain('Mensagem é um campo obrigatório.');
  });

  it('deve emitir cancelar ao clicar em cancelar', () => {
    criarComponente();
    const spy = jest.fn();
    componente.cancelar.subscribe(spy);

    botaoCancelar().click();

    expect(spy).toHaveBeenCalled();
  });

  it('não deve ter violações de acessibilidade', async () => {
    criarComponente();

    const resultados = await axe(fixture.nativeElement);
    expect(resultados).toHaveNoViolations();
  });
});
