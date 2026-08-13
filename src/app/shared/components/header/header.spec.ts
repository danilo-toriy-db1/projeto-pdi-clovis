import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { axe } from 'jest-axe';
import { IntentLogin } from '../../models/enums/intent-login.enum';
import { AuthService } from '../../services/auth.service/auth.service';
import { Header } from './header';

describe('Header', () => {
  let fixture: ComponentFixture<Header>;
  let componente: Header;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark-mode');
    document.body.style.overflow = '';
    TestBed.configureTestingModule({ imports: [Header] });
    fixture = TestBed.createComponent(Header);
    componente = fixture.componentInstance;
  });

  function botaoTema(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.header__botao-tema');
  }

  function botaoHamburguer(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('.header__hamburguer');
  }

  function botaoLogout(): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector('.header__botao-logout');
  }

  it('deve alternar o tema ao clicar no botão de tema', () => {
    fixture.detectChanges();

    expect(document.documentElement.classList.contains('dark-mode')).toBe(false);

    botaoTema().click();
    fixture.detectChanges();

    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
  });

  describe('ícones', () => {
    function imagemTema(): HTMLImageElement {
      return botaoTema().querySelector('img')!;
    }

    it('deve renderizar o ícone de lua (dark-mode) com alt vazio quando o tema é claro', () => {
      fixture.detectChanges();

      expect(imagemTema().getAttribute('alt')).toBe('');
      expect(imagemTema().src).toContain('/icons/dark-mode.svg');
    });

    it('deve trocar para o ícone de sol (light-mode) quando o tema alternar para escuro', () => {
      fixture.detectChanges();

      botaoTema().click();
      fixture.detectChanges();

      expect(imagemTema().src).toContain('/icons/light-mode.svg');
    });

    it('deve renderizar o ícone do hambúrguer e, com sessão ativa, o ícone de logout, ambos decorativos', async () => {
      const authService = TestBed.inject(AuthService);
      await authService.autenticar('user', '123U', IntentLogin.LOGIN);
      fixture.detectChanges();

      const iconeHamburguer: HTMLImageElement = fixture.nativeElement.querySelector(
        '.header__hamburguer img',
      );
      const iconeLogout: HTMLImageElement = botaoLogout()!.querySelector('img')!;

      expect(iconeHamburguer.getAttribute('alt')).toBe('');
      expect(iconeHamburguer.src).toContain('/icons/menu.svg');
      expect(iconeLogout.getAttribute('alt')).toBe('');
      expect(iconeLogout.src).toContain('/icons/logout-icon.svg');
    });

    it('não deve ter violações de acessibilidade com o header renderizado (com sessão ativa)', async () => {
      const authService = TestBed.inject(AuthService);
      await authService.autenticar('user', '123U', IntentLogin.LOGIN);
      fixture.detectChanges();

      const resultados = await axe(fixture.nativeElement);
      expect(resultados).toHaveNoViolations();
    });
  });

  it('deve iniciar a sidebar fechada, com o hambúrguer refletindo o estado via aria-expanded', () => {
    fixture.detectChanges();

    const hamburguer = botaoHamburguer();
    expect(hamburguer.getAttribute('aria-expanded')).toBe('false');
    expect(fixture.nativeElement.querySelector('.header__sidebar--aberta')).toBeNull();
  });

  it('deve abrir a sidebar ao clicar no hambúrguer e fechar ao pressionar Esc', () => {
    fixture.detectChanges();

    botaoHamburguer().click();
    fixture.detectChanges();

    expect(botaoHamburguer().getAttribute('aria-expanded')).toBe('true');
    expect(fixture.nativeElement.querySelector('.header__sidebar--aberta')).not.toBeNull();
    expect(document.body.style.overflow).toBe('hidden');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(botaoHamburguer().getAttribute('aria-expanded')).toBe('false');
    expect(fixture.nativeElement.querySelector('.header__sidebar--aberta')).toBeNull();
    expect(document.body.style.overflow).toBe('');
  });

  it('deve fechar a sidebar ao clicar no backdrop', () => {
    fixture.detectChanges();
    botaoHamburguer().click();
    fixture.detectChanges();

    const backdrop: HTMLElement = fixture.nativeElement.querySelector('.header__backdrop');
    backdrop.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.header__sidebar--aberta')).toBeNull();
  });

  it('não deve exibir o botão de logout sem sessão ativa', () => {
    fixture.detectChanges();

    expect(botaoLogout()).toBeNull();
  });

  it('deve exibir o botão de logout quando há sessão ativa e a variante não é reduzida', async () => {
    const authService = TestBed.inject(AuthService);
    await authService.autenticar('user', '123U', IntentLogin.LOGIN);
    fixture.detectChanges();

    expect(botaoLogout()).not.toBeNull();
  });

  it('nunca deve exibir o botão de logout na variante reduzida, mesmo com sessão ativa', async () => {
    const authService = TestBed.inject(AuthService);
    await authService.autenticar('user', '123U', IntentLogin.LOGIN);
    fixture.componentRef.setInput('reduzido', true);
    fixture.detectChanges();

    expect(botaoLogout()).toBeNull();
  });

  it('deve remover a sessão ao clicar no botão de logout', async () => {
    const authService = TestBed.inject(AuthService);
    await authService.autenticar('user', '123U', IntentLogin.LOGIN);
    fixture.detectChanges();

    botaoLogout()?.click();
    fixture.detectChanges();

    expect(authService.sessao()).toBeNull();
    expect(localStorage.getItem('login.sessao')).toBeNull();
    expect(botaoLogout()).toBeNull();
  });

  describe('páginas navegáveis', () => {
    function linksDePaginas(): HTMLAnchorElement[] {
      return Array.from(fixture.nativeElement.querySelectorAll('.header .header__pagina'));
    }

    it('não deve exibir nenhuma navegação de páginas quando o input não é informado', () => {
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.header__paginas')).toBeNull();
    });

    it('deve exibir um link por página recebida, com rótulo textual e a rota informada', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ imports: [Header], providers: [provideRouter([])] });
      fixture = TestBed.createComponent(Header);
      fixture.componentRef.setInput('paginas', [
        { rotulo: 'Página Inicial', rota: '' },
        { rotulo: 'Editar Dados', rota: 'editar-dados' },
        { rotulo: 'Editar Usuários', rota: 'editar-usuarios' },
      ]);
      fixture.detectChanges();

      const links = linksDePaginas();
      expect(links).toHaveLength(3);
      expect(links.map((link) => link.textContent?.trim())).toEqual([
        'Página Inicial',
        'Editar Dados',
        'Editar Usuários',
      ]);
    });
  });
});
