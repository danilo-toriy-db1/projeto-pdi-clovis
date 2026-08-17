import { ComponentFixture, TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { AlertModal } from './alert-modal';

describe('AlertModal', () => {
  let fixture: ComponentFixture<AlertModal>;
  let componente: AlertModal;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AlertModal] });
    fixture = TestBed.createComponent(AlertModal);
    componente = fixture.componentInstance;
    fixture.componentRef.setInput('titulo', 'Acesso restrito');
    fixture.componentRef.setInput('mensagem', 'Você deve estar logado para isso!');
    fixture.detectChanges();
  });

  it('deve exibir o título e a mensagem informados', () => {
    expect(fixture.nativeElement.querySelector('#alert-modal-titulo').textContent).toBe(
      'Acesso restrito',
    );
    expect(fixture.nativeElement.querySelector('#alert-modal-mensagem').textContent).toBe(
      'Você deve estar logado para isso!',
    );
  });

  it('deve usar "Entendi" como rótulo padrão do botão de ação', () => {
    const botao: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.alert-modal__confirmar',
    );

    expect(botao.textContent?.trim()).toBe('Entendi');
  });

  it('deve exibir um rótulo customizado quando informado', () => {
    fixture.componentRef.setInput('rotuloAcao', 'Fechar');
    fixture.detectChanges();

    const botao: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.alert-modal__confirmar',
    );
    expect(botao.textContent?.trim()).toBe('Fechar');
  });

  it('deve emitir fechar e devolver o foco ao elemento que abriu o modal, ao clicar no botão de ação', () => {
    const botaoDeAbertura = document.createElement('button');
    document.body.appendChild(botaoDeAbertura);
    botaoDeAbertura.focus();

    fixture = TestBed.createComponent(AlertModal);
    componente = fixture.componentInstance;
    fixture.componentRef.setInput('titulo', 'Acesso restrito');
    fixture.componentRef.setInput('mensagem', 'mensagem');
    fixture.detectChanges();

    const spy = jest.fn();
    componente.fechar.subscribe(spy);

    fixture.nativeElement.querySelector('.alert-modal__confirmar').click();

    expect(spy).toHaveBeenCalled();
    expect(document.activeElement).toBe(botaoDeAbertura);

    botaoDeAbertura.remove();
  });

  it('deve usar role="alertdialog" com aria-labelledby e aria-describedby apontando para título e mensagem', () => {
    const dialogo: HTMLElement = fixture.nativeElement.querySelector('.alert-modal');

    expect(dialogo.getAttribute('role')).toBe('alertdialog');
    expect(dialogo.getAttribute('aria-labelledby')).toBe('alert-modal-titulo');
    expect(dialogo.getAttribute('aria-describedby')).toBe('alert-modal-mensagem');
  });

  it('não deve ter violações de acessibilidade', async () => {
    const resultados = await axe(fixture.nativeElement);
    expect(resultados).toHaveNoViolations();
  });
});
