import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeedbackModal } from './feedback-modal';

describe('FeedbackModal', () => {
  let fixture: ComponentFixture<FeedbackModal>;

  function criarComponente(): void {
    TestBed.configureTestingModule({ imports: [FeedbackModal] });
    fixture = TestBed.createComponent(FeedbackModal);
  }

  function textoExibido(): string {
    return fixture.nativeElement.querySelector('[role="status"]').textContent.trim();
  }

  it('deve exibir o spinner e o texto padrão no estado carregando', () => {
    criarComponente();
    fixture.componentRef.setInput('estado', 'carregando');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.feedback-modal__spinner')).not.toBeNull();
    expect(textoExibido()).toBe('Carregando…');
  });

  it('deve exibir o check e o texto padrão no estado sucesso', () => {
    criarComponente();
    fixture.componentRef.setInput('estado', 'sucesso');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.feedback-modal__check')).not.toBeNull();
    expect(textoExibido()).toBe('Sucesso!');
  });

  it('deve exibir apenas o texto informado no estado mensagem, sem spinner nem check', () => {
    criarComponente();
    fixture.componentRef.setInput('estado', 'mensagem');
    fixture.componentRef.setInput('mensagem', 'Credenciais Inválidas.');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.feedback-modal__spinner')).toBeNull();
    expect(fixture.nativeElement.querySelector('.feedback-modal__check')).toBeNull();
    expect(textoExibido()).toBe('Credenciais Inválidas.');
  });

  it('deve substituir o texto padrão por uma mensagem customizada em qualquer estado', () => {
    criarComponente();
    fixture.componentRef.setInput('estado', 'sucesso');
    fixture.componentRef.setInput('mensagem', 'Sucesso! Redirecionando…');
    fixture.detectChanges();

    expect(textoExibido()).toBe('Sucesso! Redirecionando…');
  });

  it('deve anunciar o texto numa região aria-live polite', () => {
    criarComponente();
    fixture.componentRef.setInput('estado', 'carregando');
    fixture.detectChanges();

    const regiao: HTMLElement = fixture.nativeElement.querySelector('[role="status"]');
    expect(regiao.getAttribute('aria-live')).toBe('polite');
  });
});
