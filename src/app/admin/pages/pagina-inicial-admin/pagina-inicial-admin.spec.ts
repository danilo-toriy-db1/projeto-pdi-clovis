import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { axe } from 'jest-axe';
import { ThemeService } from '../../../shared/services/theme.service/theme.service';
import { PaginaInicialAdmin } from './pagina-inicial-admin';

describe('PaginaInicialAdmin', () => {
  let fixture: ComponentFixture<PaginaInicialAdmin>;
  let componente: PaginaInicialAdmin;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark-mode');
    TestBed.configureTestingModule({
      imports: [PaginaInicialAdmin],
      providers: [provideRouter([])],
    });
    fixture = TestBed.createComponent(PaginaInicialAdmin);
    componente = fixture.componentInstance;
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture.detectChanges();
  });

  function cards(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.pagina-inicial-admin__card'));
  }

  it('deve exibir os 3 cards com rótulo textual próprio', () => {
    const titulos = cards().map((card) => card.textContent?.trim());

    expect(titulos.length).toBe(3);
    expect(titulos[0]).toContain('Alternar tema');
    expect(titulos[1]).toContain('Voltar para a Landing Page');
    expect(titulos[2]).toContain('Editar Dados');
  });

  it('card 1 deve alternar o tema ativo da aplicação', () => {
    const themeService = TestBed.inject(ThemeService);

    expect(themeService.temaEscuro()).toBe(false);
    cards()[0].click();

    expect(themeService.temaEscuro()).toBe(true);
  });

  it('card 2 deve navegar para /landing-page', () => {
    cards()[1].click();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/landing-page');
  });

  it('card 3 deve emitir irParaEditarDados, sem navegar de verdade', () => {
    const spy = jest.fn();
    componente.irParaEditarDados.subscribe(spy);

    cards()[2].click();

    expect(spy).toHaveBeenCalled();
  });

  it('o ícone do card de alternar tema deve ser decorativo (alt vazio) e renderizar com src resolvido', () => {
    const icone: HTMLImageElement = cards()[0].querySelector('img')!;

    expect(icone.getAttribute('alt')).toBe('');
    expect(icone.src).toContain('/icons/change-icon.svg');
  });

  it('não deve ter violações de acessibilidade com os cards renderizados', async () => {
    const resultados = await axe(fixture.nativeElement);
    expect(resultados).toHaveNoViolations();
  });
});
