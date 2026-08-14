import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { axe } from 'jest-axe';
import { IntentLogin } from '../../../shared/models/enums/intent-login.enum';
import { AuthService } from '../../../shared/services/auth.service/auth.service';
import { ThemeService } from '../../../shared/services/theme.service/theme.service';
import { PaginaInicialLanding } from './pagina-inicial-landing';

describe('PaginaInicialLanding', () => {
  let fixture: ComponentFixture<PaginaInicialLanding>;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark-mode');
    TestBed.configureTestingModule({
      imports: [PaginaInicialLanding],
      providers: [provideRouter([])],
    });
    fixture = TestBed.createComponent(PaginaInicialLanding);
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture.detectChanges();
  });

  function cards(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.pagina-inicial-landing__card'));
  }

  it('deve exibir os 3 cards com rótulo textual próprio', () => {
    const titulos = cards().map((card) => card.textContent?.trim());

    expect(titulos.length).toBe(3);
    expect(titulos[0]).toContain('Repositório no GitHub');
    expect(titulos[1]).toContain('Sua Landing Page');
    expect(titulos[2]).toContain('Tema e responsividade');
  });

  it('card 1 deve linkar para o repositório GitHub em uma nova aba', () => {
    const link = cards()[0] as HTMLAnchorElement;

    expect(link.href).toBe('https://github.com/');
    expect(link.target).toBe('_blank');
  });

  it('card 2 sem sessão ativa navega para /admin', () => {
    (cards()[1] as HTMLButtonElement).click();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/admin');
  });

  it('card 2 com sessão user navega para /admin, bloqueada como se não houvesse sessão', async () => {
    const authService = TestBed.inject(AuthService);
    await authService.autenticar('user', '123U', IntentLogin.LOGIN);

    (cards()[1] as HTMLButtonElement).click();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/admin');
  });

  it('card 2 com sessão admin navega direto para /admin/admin, sinalizando a vista de editar dados', async () => {
    const authService = TestBed.inject(AuthService);
    await authService.autenticar('admin', '123@', IntentLogin.LOGIN);

    (cards()[1] as HTMLButtonElement).click();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/admin/admin', {
      state: { vistaInicial: 'editar-dados' },
    });
  });

  it('card 2 com sessão super navega direto para /admin/control, sinalizando a vista de editar dados', async () => {
    const authService = TestBed.inject(AuthService);
    await authService.autenticar('superAdmin', '123Super', IntentLogin.LOGIN);

    (cards()[1] as HTMLButtonElement).click();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/admin/control', {
      state: { vistaInicial: 'editar-dados' },
    });
  });

  it('card 3 deve alternar o tema ativo da aplicação', () => {
    const themeService = TestBed.inject(ThemeService);

    expect(themeService.temaEscuro()).toBe(false);
    (cards()[2] as HTMLButtonElement).click();

    expect(themeService.temaEscuro()).toBe(true);
  });

  it('a logo e os ícones dos cards devem renderizar com src resolvido, e os ícones decorativos com alt vazio', () => {
    const logo: HTMLImageElement = fixture.nativeElement.querySelector(
      '.pagina-inicial-landing img[alt="Logo do projeto"]',
    );
    const iconeGithub: HTMLImageElement = cards()[0].querySelector('img')!;
    const iconeTema: HTMLImageElement = cards()[2].querySelector('img')!;

    expect(logo.getAttribute('src')).toBeTruthy();
    expect(iconeGithub.getAttribute('alt')).toBe('');
    expect(iconeGithub.src).toContain('/icons/github-icon.svg');
    expect(iconeTema.getAttribute('alt')).toBe('');
    expect(iconeTema.src).toContain('/icons/change-icon.svg');
  });

  it('não deve ter violações de acessibilidade com a logo e os cards renderizados', async () => {
    const resultados = await axe(fixture.nativeElement);
    expect(resultados).toHaveNoViolations();
  });
});
