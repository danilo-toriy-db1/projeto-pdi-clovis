import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingPageNaoEncontrada } from './landing-page-nao-encontrada';

describe('LandingPageNaoEncontrada', () => {
  let fixture: ComponentFixture<LandingPageNaoEncontrada>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [LandingPageNaoEncontrada] });
    fixture = TestBed.createComponent(LandingPageNaoEncontrada);
    fixture.componentRef.setInput('mensagem', 'Não encontramos essa Landing Page.');
    fixture.detectChanges();
  });

  it('deve exibir a mensagem recebida via input', () => {
    const mensagem: HTMLElement = fixture.nativeElement.querySelector(
      '.landing-page-nao-encontrada__mensagem',
    );

    expect(mensagem.textContent?.trim()).toBe('Não encontramos essa Landing Page.');
  });

  it('deve exibir o código 404 no espírito visual do erro do GitHub', () => {
    const codigo: HTMLElement = fixture.nativeElement.querySelector(
      '.landing-page-nao-encontrada__codigo',
    );

    expect(codigo.textContent?.trim()).toBe('404');
  });
});
