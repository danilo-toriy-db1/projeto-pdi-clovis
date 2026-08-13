import { ComponentFixture, TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { ConfirmModal } from './confirm-modal';

describe('ConfirmModal', () => {
  let fixture: ComponentFixture<ConfirmModal>;
  let componente: ConfirmModal;

  function criarComponente(): void {
    TestBed.configureTestingModule({ imports: [ConfirmModal] });
    fixture = TestBed.createComponent(ConfirmModal);
    fixture.componentRef.setInput('mensagem', 'Remover esta entrada?');
    componente = fixture.componentInstance;
  }

  function botaoConfirmar(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.confirm-modal__confirmar');
  }

  function botaoCancelar(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.confirm-modal__cancelar');
  }

  it('deve alertar que a exclusão é permanente', () => {
    criarComponente();
    fixture.detectChanges();

    const dialogo: HTMLElement = fixture.nativeElement.querySelector('[role="alertdialog"]');
    expect(dialogo.textContent).toContain('Remover esta entrada?');
    expect(dialogo.textContent).toContain('permanente');
  });

  it('deve emitir confirmar ao clicar no botão de excluir', () => {
    criarComponente();
    fixture.detectChanges();
    const spy = jest.fn();
    componente.confirmar.subscribe(spy);

    botaoConfirmar().click();

    expect(spy).toHaveBeenCalled();
  });

  it('deve emitir cancelar ao clicar no botão de cancelar', () => {
    criarComponente();
    fixture.detectChanges();
    const spy = jest.fn();
    componente.cancelar.subscribe(spy);

    botaoCancelar().click();

    expect(spy).toHaveBeenCalled();
  });

  it('deve renderizar o ícone de exclusão no botão de confirmar, com alt vazio e o rótulo textual preservado', () => {
    criarComponente();
    fixture.detectChanges();

    const icone: HTMLImageElement = botaoConfirmar().querySelector('img')!;
    expect(icone.getAttribute('alt')).toBe('');
    expect(icone.src).toContain('/icons/delete-icon.svg');
    expect(botaoConfirmar().textContent?.trim()).toBe('Excluir');
  });

  it('não deve ter violações de acessibilidade com o modal renderizado', async () => {
    criarComponente();
    fixture.detectChanges();

    const resultados = await axe(fixture.nativeElement);
    expect(resultados).toHaveNoViolations();
  });

  it('deve devolver o foco ao elemento que abriu o modal quando cancelado', () => {
    const botaoAbridor = document.createElement('button');
    document.body.appendChild(botaoAbridor);
    botaoAbridor.focus();

    criarComponente();
    fixture.detectChanges();
    botaoCancelar().click();

    expect(document.activeElement).toBe(botaoAbridor);
    botaoAbridor.remove();
  });
});
