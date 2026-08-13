import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Header } from '../../../shared/components/header/header';
import { LoginPage } from './login-page';

describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideRouter([])],
    });
    fixture = TestBed.createComponent(LoginPage);
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture.detectChanges();
  });

  it('deve renderizar o header na variante reduzida', () => {
    const header = fixture.debugElement.query(By.directive(Header)).componentInstance as Header;

    expect(header.reduzido()).toBe(true);
  });

  it('deve exibir a composição decorativa animada (brilho e bolhas), marcada como aria-hidden', () => {
    const decoracao: HTMLElement = fixture.nativeElement.querySelector('.login-page__decoracao');
    const brilho = fixture.nativeElement.querySelector('.login-page__brilho');
    const bolhas = fixture.nativeElement.querySelectorAll('.login-page__bolha');

    expect(decoracao.getAttribute('aria-hidden')).toBe('true');
    expect(brilho).not.toBeNull();
    expect(bolhas.length).toBeGreaterThan(0);
  });

  it('deve suprimir as animações de brilho e bolhas sob prefers-reduced-motion (guardadas pelo mixin dedicado)', () => {
    const scss = readFileSync(join(__dirname, 'login-page.scss'), 'utf-8');
    const blocoBrilho = scss.slice(scss.indexOf('.login-page__brilho'), scss.indexOf('.login-page__bolha'));
    const blocoBolha = scss.slice(scss.indexOf('.login-page__bolha'), scss.indexOf('.login-page__conteudo'));

    expect(blocoBrilho).toContain('sem-preferencia-de-movimento-reduzido');
    expect(blocoBolha).toContain('sem-preferencia-de-movimento-reduzido');
    expect(blocoBrilho.split('sem-preferencia-de-movimento-reduzido')[0]).not.toContain('animation:');
    expect(blocoBolha.split('sem-preferencia-de-movimento-reduzido')[0]).not.toContain('animation:');
  });

  it('TC-21: deve navegar para /landing-page ao clicar no botão de acesso sem login, sem abrir o modal', () => {
    const botao: HTMLButtonElement = fixture.nativeElement.querySelector('.login-page__botao-landing');

    botao.click();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/landing-page');
    expect(fixture.nativeElement.querySelector('app-login-modal')).toBeNull();
  });

  it('deve abrir o modal de login ao clicar no botão "Login" e fechar ao emitir o evento fechar', () => {
    const [botaoLogin]: HTMLButtonElement[] = fixture.nativeElement.querySelectorAll(
      '.login-page__botoes-entrada button',
    );

    botaoLogin.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-login-modal')).not.toBeNull();

    const backdrop: HTMLElement = fixture.nativeElement.querySelector('.login-page__backdrop');
    backdrop.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-login-modal')).toBeNull();
  });

  it('deve abrir o modal de login ao clicar no botão "Painel Admin"', () => {
    const [, botaoPainelAdmin]: HTMLButtonElement[] = fixture.nativeElement.querySelectorAll(
      '.login-page__botoes-entrada button',
    );

    botaoPainelAdmin.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-login-modal')).not.toBeNull();
  });
});
