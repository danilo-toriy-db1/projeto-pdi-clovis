import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { axe } from 'jest-axe';
import { Role } from '../../../shared/models/enums/role.enum';
import { ThemeService } from '../../../shared/services/theme.service/theme.service';
import { autenticarComo } from '../../../shared/testing/autenticar-como';
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

  describe('sessão super', () => {
    beforeEach(() => {
      autenticarComo('superAdmin', Role.SUPER);
      TestBed.resetTestingModule();
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

    it('deve exibir a saudação e a descrição específicas do super admin', () => {
      const saudacao = fixture.nativeElement.querySelector('.pagina-inicial-admin__boas-vindas');
      const descricao = fixture.nativeElement.querySelector('.pagina-inicial-admin__descricao');

      expect(saudacao.textContent?.trim()).toBe('Olá, Super admin!');
      expect(descricao.textContent?.trim()).toBe(
        'Gerencie os administradores, usuários e a Landing Page como um todo.',
      );
    });

    it('deve exibir os 3 cards de gestão do super admin', () => {
      const titulos = cards().map((card) => card.textContent?.trim());

      expect(titulos.length).toBe(3);
      expect(titulos[0]).toContain('Gerencie Landings Pages');
      expect(titulos[1]).toContain('Gerencie Usuários');
      expect(titulos[2]).toContain('Envie sugestões');
    });

    it('card 1 (Gerencie Landings Pages) deve emitir irParaEditarDados', () => {
      const spy = jest.fn();
      componente.irParaEditarDados.subscribe(spy);

      cards()[0].click();

      expect(spy).toHaveBeenCalled();
    });

    it('card 2 (Gerencie Usuários) deve emitir irParaEditarUsuarios', () => {
      const spy = jest.fn();
      componente.irParaEditarUsuarios.subscribe(spy);

      cards()[1].click();

      expect(spy).toHaveBeenCalled();
    });

    it('card 3 (Envie sugestões) deve abrir um modal com o formulário de mensagem de feedback', () => {
      expect(fixture.nativeElement.querySelector('app-edit-modal')).toBeNull();

      cards()[2].click();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-edit-modal')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('app-formulario-mensagem-feedback')).not.toBeNull();
    });

    it('deve apenas fazer console.log da mensagem enviada no modal de sugestão, e fechar o modal', () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      cards()[2].click();
      fixture.detectChanges();

      const campoMensagem: HTMLTextAreaElement = fixture.nativeElement.querySelector(
        '#feedback-mensagem',
      );
      campoMensagem.value = 'Sugestão de teste';
      campoMensagem.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      fixture.nativeElement
        .querySelector('.formulario-mensagem-feedback__acoes button[type="submit"]')
        .click();
      fixture.detectChanges();

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Sugestão'),
        'Sugestão de teste',
      );
      expect(fixture.nativeElement.querySelector('app-edit-modal')).toBeNull();
      logSpy.mockRestore();
    });

    it('deve fechar o modal de sugestão ao cancelar, sem fazer console.log', () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      cards()[2].click();
      fixture.detectChanges();

      fixture.nativeElement
        .querySelector('.formulario-mensagem-feedback__acoes button[type="button"]')
        .click();
      fixture.detectChanges();

      expect(logSpy).not.toHaveBeenCalled();
      expect(fixture.nativeElement.querySelector('app-edit-modal')).toBeNull();
      logSpy.mockRestore();
    });

    it('não deve ter violações de acessibilidade com os cards do super admin renderizados', async () => {
      const resultados = await axe(fixture.nativeElement);
      expect(resultados).toHaveNoViolations();
    });
  });
});
