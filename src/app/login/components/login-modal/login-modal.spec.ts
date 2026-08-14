import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { axe } from 'jest-axe';
import { IntentLogin } from '../../../shared/models/enums/intent-login.enum';
import { Role } from '../../../shared/models/enums/role.enum';
import { AuthService } from '../../../shared/services/auth.service/auth.service';
import { ThemeService } from '../../../shared/services/theme.service/theme.service';
import { LoginModal } from './login-modal';

jest.setTimeout(15000);

describe('LoginModal', () => {
  let fixture: ComponentFixture<LoginModal>;
  let componente: LoginModal;
  let router: Router;

  function criarComponente(intent: IntentLogin): void {
    TestBed.configureTestingModule({
      imports: [LoginModal],
      providers: [provideRouter([])],
    });
    fixture = TestBed.createComponent(LoginModal);
    fixture.componentRef.setInput('intent', intent);
    componente = fixture.componentInstance;
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    fixture.detectChanges();
  }

  function preencherLogin(usuario: string, senha: string): void {
    (componente as any).formularioLogin.setValue({ usuario, senha });
  }

  function enviarLogin(): Promise<void> {
    return (componente as any).enviarLogin();
  }

  function estadoAtual(): string {
    return (componente as any).estado();
  }

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark-mode');
  });

  describe('ícone de fechar', () => {
    beforeEach(() => criarComponente(IntentLogin.LOGIN));

    function iconeFechar(): HTMLImageElement {
      return fixture.nativeElement.querySelector('.modal__fechar img');
    }

    it('deve usar o ícone preto (fundo claro) com alt vazio quando o tema é claro', () => {
      expect(iconeFechar().getAttribute('alt')).toBe('');
      expect(iconeFechar().src).toContain('/icons/black-close-icon.svg');
    });

    it('deve trocar para o ícone branco quando o tema é escuro', () => {
      TestBed.inject(ThemeService).alternarTema();
      fixture.detectChanges();

      expect(iconeFechar().src).toContain('/icons/close-icon.svg');
    });

    it('não deve ter violações de acessibilidade no formulário de login', async () => {
      const resultados = await axe(fixture.nativeElement);
      expect(resultados).toHaveNoViolations();
    });
  });

  describe('botão "Login"', () => {
    beforeEach(() => criarComponente(IntentLogin.LOGIN));

    it('TC-1: usuário e senha inexistentes → Usuário Não Encontrado', async () => {
      preencherLogin('conta-inexistente', 'qualquer123');

      await enviarLogin();

      expect(estadoAtual()).toBe('usuario-nao-encontrado');
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('TC-2: usuário válido com senha errada → Credenciais Inválidas', async () => {
      preencherLogin('admin', 'senha-errada');

      await enviarLogin();

      expect(estadoAtual()).toBe('credenciais-invalidas');
      expect(router.navigateByUrl).not.toHaveBeenCalled();
    });

    it('TC-3: senha válida com usuário errado → Credenciais Inválidas', async () => {
      preencherLogin('usuario-errado', '123U');

      await enviarLogin();

      expect(estadoAtual()).toBe('credenciais-invalidas');
    });

    it('TC-4: login bem-sucedido role user → redireciona a /landing-page', async () => {
      preencherLogin('user', '123U');

      await enviarLogin();

      expect(estadoAtual()).toBe('sucesso');
      expect(router.navigateByUrl).toHaveBeenCalledWith('/landing-page');
    });

    it('TC-5: login bem-sucedido role admin → redireciona a /admin/{id}', async () => {
      preencherLogin('admin', '123@');

      await enviarLogin();

      expect(estadoAtual()).toBe('sucesso');
      expect(router.navigateByUrl).toHaveBeenCalledWith('/admin/admin');
    });

    it('TC-6: login bem-sucedido role super → redireciona a /admin/control', async () => {
      preencherLogin('superAdmin', '123Super');

      await enviarLogin();

      expect(estadoAtual()).toBe('sucesso');
      expect(router.navigateByUrl).toHaveBeenCalledWith('/admin/control');
    });

    it('não deve chamar autenticação com o formulário vazio', async () => {
      const authService = TestBed.inject(AuthService);
      const spy = jest.spyOn(authService, 'autenticar');

      await enviarLogin();

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('botão "Painel Admin"', () => {
    beforeEach(() => criarComponente(IntentLogin.PAINEL_ADMIN));

    it('TC-7: role user tenta entrar → Acesso Negado, sessão gravada, sem navegação', async () => {
      preencherLogin('user', '123U');

      await enviarLogin();

      expect(estadoAtual()).toBe('acesso-negado');
      expect(router.navigateByUrl).not.toHaveBeenCalled();
      expect(JSON.parse(localStorage.getItem('login.sessao') ?? 'null')).toEqual({
        usuario: 'user',
        role: Role.USER,
      });
    });

    it('TC-8: role admin entra → mesmo resultado de Sucesso', async () => {
      preencherLogin('admin', '123@');

      await enviarLogin();

      expect(estadoAtual()).toBe('sucesso');
      expect(router.navigateByUrl).toHaveBeenCalledWith('/admin/admin');
    });

    it('TC-9: role super entra → mesmo resultado de Sucesso', async () => {
      preencherLogin('superAdmin', '123Super');

      await enviarLogin();

      expect(estadoAtual()).toBe('sucesso');
      expect(router.navigateByUrl).toHaveBeenCalledWith('/admin/control');
    });
  });

  describe('criação de conta', () => {
    beforeEach(() => criarComponente(IntentLogin.LOGIN));

    function abrirCriarConta(): void {
      (componente as any).abrirCriarConta();
      fixture.detectChanges();
    }

    function preencherCriarConta(usuario: string, senha: string, role: Role): void {
      (componente as any).formularioCriarConta.setValue({ usuario, senha, role });
    }

    function enviarCriarConta(): Promise<void> {
      return (componente as any).enviarCriarConta();
    }

    it('TC-14: cria conta tipo user sem sessão prévia, com a senha criptografada', async () => {
      abrirCriarConta();
      preencherCriarConta('novo-usuario-teste', 'SenhaTeste1', Role.USER);

      await enviarCriarConta();

      const usuariosSalvos = JSON.parse(localStorage.getItem('login.usuarios') ?? '[]');
      const registro = usuariosSalvos.find((usuario: { usuario: string }) => usuario.usuario === 'novo-usuario-teste');
      expect(registro.role).toBe(Role.USER);
      expect(registro.senha).not.toBe('SenhaTeste1');
      expect((componente as any).modoCriarConta()).toBe(false);
    });

    it('TC-15: cria conta tipo admin → login subsequente chega a /admin/{id}', async () => {
      abrirCriarConta();
      preencherCriarConta('novo-admin-teste', 'SenhaTeste1', Role.ADMIN);

      await enviarCriarConta();

      preencherLogin('novo-admin-teste', 'SenhaTeste1');
      await enviarLogin();

      expect(estadoAtual()).toBe('sucesso');
      expect(router.navigateByUrl).toHaveBeenCalledWith('/admin/novo-admin-teste');
    });

    it('TC-16: a role super nunca é oferecida como tipo de conta criável', () => {
      abrirCriarConta();

      const opcoes: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll(
        'input[formcontrolname="role"]',
      );
      const fieldset: HTMLElement = fixture.nativeElement.querySelector('fieldset');

      expect(opcoes).toHaveLength(2);
      expect(fieldset.textContent).toMatch(/usu[aá]rio/i);
      expect(fieldset.textContent).toMatch(/admin/i);
      expect(fieldset.textContent?.toLowerCase()).not.toContain('super');
    });
  });
});
