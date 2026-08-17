import { ComponentFixture, TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { Role } from '../../../shared/models/enums/role.enum';
import { AuthService } from '../../../shared/services/auth.service/auth.service';
import { autenticarComo } from '../../../shared/testing/autenticar-como';
import { EditarUsuarios } from './editar-usuarios';

describe('EditarUsuarios', () => {
  let fixture: ComponentFixture<EditarUsuarios>;
  let componente: EditarUsuarios;

  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  async function criarComponente(): Promise<void> {
    TestBed.configureTestingModule({ imports: [EditarUsuarios] });
    fixture = TestBed.createComponent(EditarUsuarios);
    componente = fixture.componentInstance;
    fixture.detectChanges();
    await componente['carregamentoInicial'];
    fixture.detectChanges();
  }

  function cardsDeUsuario(): HTMLLIElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.editar-usuarios__card-usuario'));
  }

  function abrirEdicaoPorUsuario(usuario: string): void {
    const alvo = cardsDeUsuario().find((card) => card.textContent?.includes(usuario));
    (alvo!.querySelector('button') as HTMLButtonElement).click();
    fixture.detectChanges();
  }

  function abrirCriacao(): void {
    fixture.nativeElement
      .querySelector('.editar-usuarios__card-usuario--adicionar button')
      .click();
    fixture.detectChanges();
  }

  async function submeterFormulario(): Promise<void> {
    fixture.nativeElement.querySelector('.formulario-usuario__acoes button[type="submit"]').click();
    fixture.detectChanges();
    await jest.advanceTimersByTimeAsync(500);
    fixture.detectChanges();
    await jest.advanceTimersByTimeAsync(800);
    fixture.detectChanges();
  }

  describe('TC-19/TC-25: sessão super', () => {
    beforeEach(async () => {
      autenticarComo('superAdmin', Role.SUPER);
      await criarComponente();
    });

    it('TC-19: deve listar todos os usuários, incluindo contas super', () => {
      const usuarios = cardsDeUsuario().map((card) => card.querySelector('h2')?.textContent?.trim());

      expect(usuarios).toEqual(expect.arrayContaining(['user', 'admin', 'superAdmin']));
    });

    it('TC-25: ao editar a conta superAdmin, não deve exibir a ação de remover', () => {
      abrirEdicaoPorUsuario('superAdmin');

      expect(fixture.nativeElement.querySelector('.editar-usuarios__remover-usuario')).toBeNull();
    });

    it('ao editar uma conta sem role super, deve exibir a ação de remover', () => {
      abrirEdicaoPorUsuario('user');

      expect(fixture.nativeElement.querySelector('.editar-usuarios__remover-usuario')).not.toBeNull();
    });

    it('o ícone do card de adicionar usuário deve ser decorativo (alt vazio) e renderizar com src resolvido', () => {
      const iconeAdicionar: HTMLImageElement = fixture.nativeElement.querySelector(
        '.editar-usuarios__card-usuario--adicionar img',
      );

      expect(iconeAdicionar.getAttribute('alt')).toBe('');
      expect(iconeAdicionar.getAttribute('src')).toBeTruthy();
    });

    it('não deve ter violações de acessibilidade com a grade de usuários renderizada', async () => {
      jest.useRealTimers();

      const resultados = await axe(fixture.nativeElement);
      expect(resultados).toHaveNoViolations();
    });

    it('não deve ter violações de acessibilidade com o modal de usuário aberto', async () => {
      abrirCriacao();
      jest.useRealTimers();

      const resultados = await axe(fixture.nativeElement);
      expect(resultados).toHaveNoViolations();
    });

    it('TC-21: deve criar um usuário com role super', async () => {
      abrirCriacao();
      fixture.nativeElement.querySelector('#usuario-login').value = 'novo-super';
      fixture.nativeElement.querySelector('#usuario-login').dispatchEvent(new Event('input'));
      fixture.nativeElement.querySelector('#usuario-senha').value = 'Senha1';
      fixture.nativeElement.querySelector('#usuario-senha').dispatchEvent(new Event('input'));
      fixture.nativeElement
        .querySelectorAll('input[formcontrolname="role"]')[2]
        .click();
      fixture.detectChanges();

      await submeterFormulario();

      const authService = TestBed.inject(AuthService);
      const usuarios = await authService.listarUsuarios(Role.SUPER);
      expect(
        usuarios.some((usuario) => usuario.usuario === 'novo-super' && usuario.role === Role.SUPER),
      ).toBe(true);
    });

    it('deve editar a role de um usuário existente a partir do modal', async () => {
      abrirEdicaoPorUsuario('user');
      expect((fixture.nativeElement.querySelector('#usuario-login') as HTMLInputElement).disabled).toBe(
        true,
      );

      fixture.nativeElement.querySelector('#usuario-senha').value = 'NovaSenha1';
      fixture.nativeElement.querySelector('#usuario-senha').dispatchEvent(new Event('input'));
      fixture.nativeElement.querySelectorAll('input[formcontrolname="role"]')[1].click();
      fixture.detectChanges();

      await submeterFormulario();

      const authService = TestBed.inject(AuthService);
      const usuarios = await authService.listarUsuarios(Role.SUPER);
      expect(usuarios.find((usuario) => usuario.usuario === 'user')?.role).toBe(Role.ADMIN);
      expect(fixture.nativeElement.querySelector('app-edit-modal')).toBeNull();
    });

    it('deve remover um usuário a partir do botão dentro do modal, somente após confirmar', async () => {
      abrirEdicaoPorUsuario('user');

      fixture.nativeElement.querySelector('.editar-usuarios__remover-usuario').click();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-confirm-modal')).not.toBeNull();

      await componente['confirmarRemocao']();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-edit-modal')).toBeNull();
      const authService = TestBed.inject(AuthService);
      const usuarios = await authService.listarUsuarios(Role.SUPER);
      expect(usuarios.some((usuario) => usuario.usuario === 'user')).toBe(false);
    });
  });

  describe('TC-20/TC-22/TC-23: sessão admin', () => {
    beforeEach(async () => {
      autenticarComo('admin', Role.ADMIN);
      await criarComponente();
    });

    it('TC-20: deve listar apenas usuários user/admin, sem nenhuma conta super', () => {
      const usuarios = cardsDeUsuario().map((card) => card.querySelector('h2')?.textContent?.trim());

      expect(usuarios).toEqual(expect.arrayContaining(['user', 'admin']));
      expect(usuarios).not.toContain('superAdmin');
    });

    it('TC-22: deve criar usuários com role user e com role admin', async () => {
      abrirCriacao();
      fixture.nativeElement.querySelector('#usuario-login').value = 'criado-user';
      fixture.nativeElement.querySelector('#usuario-login').dispatchEvent(new Event('input'));
      fixture.nativeElement.querySelector('#usuario-senha').value = 'Senha1';
      fixture.nativeElement.querySelector('#usuario-senha').dispatchEvent(new Event('input'));
      fixture.detectChanges();
      await submeterFormulario();

      abrirCriacao();
      fixture.nativeElement.querySelector('#usuario-login').value = 'criado-admin';
      fixture.nativeElement.querySelector('#usuario-login').dispatchEvent(new Event('input'));
      fixture.nativeElement.querySelector('#usuario-senha').value = 'Senha1';
      fixture.nativeElement.querySelector('#usuario-senha').dispatchEvent(new Event('input'));
      fixture.nativeElement.querySelectorAll('input[formcontrolname="role"]')[1].click();
      fixture.detectChanges();
      await submeterFormulario();

      const authService = TestBed.inject(AuthService);
      const usuarios = await authService.listarUsuarios(Role.SUPER);
      expect(usuarios.some((usuario) => usuario.usuario === 'criado-user')).toBe(true);
      expect(usuarios.some((usuario) => usuario.usuario === 'criado-admin')).toBe(true);
    });

    it('TC-23: não deve oferecer a opção de role super na criação', () => {
      abrirCriacao();

      const fieldset: HTMLElement = fixture.nativeElement.querySelector('fieldset');
      const opcoesDeRole = fixture.nativeElement.querySelectorAll('input[formcontrolname="role"]');

      expect(opcoesDeRole).toHaveLength(2);
      expect(fieldset.textContent?.toLowerCase()).toContain('user');
      expect(fieldset.textContent?.toLowerCase()).toContain('admin');
      expect(fieldset.textContent?.toLowerCase()).not.toContain('super');
    });

    it('deve exibir a mensagem de usuário já existente ao tentar criar um identificador duplicado', async () => {
      abrirCriacao();
      fixture.nativeElement.querySelector('#usuario-login').value = 'admin';
      fixture.nativeElement.querySelector('#usuario-login').dispatchEvent(new Event('input'));
      fixture.nativeElement.querySelector('#usuario-senha').value = 'Senha1';
      fixture.nativeElement.querySelector('#usuario-senha').dispatchEvent(new Event('input'));
      fixture.detectChanges();

      await submeterFormulario();

      expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
        'já existe',
      );
      expect(fixture.nativeElement.querySelector('app-edit-modal')).not.toBeNull();
    });
  });

  describe('TC-24: exclusão de usuário', () => {
    beforeEach(async () => {
      autenticarComo('superAdmin', Role.SUPER);
      TestBed.configureTestingModule({ imports: [EditarUsuarios] });
      await TestBed.inject(AuthService).criarUsuario(
        { usuario: 'para-remover', senha: 'Senha1', role: Role.USER },
        Role.SUPER,
      );

      fixture = TestBed.createComponent(EditarUsuarios);
      componente = fixture.componentInstance;
      fixture.detectChanges();
      await componente['carregamentoInicial'];
      fixture.detectChanges();
    });

    it('deve remover o usuário do domínio Login somente após confirmar no modal', async () => {
      const usuarioAlvo = componente['usuarios']().find(
        (usuario) => usuario.usuario === 'para-remover',
      )!;

      componente['abrirEdicaoUsuario'](usuarioAlvo);
      fixture.detectChanges();
      componente['pedirRemocaoUsuarioEmEdicao']();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-confirm-modal')).not.toBeNull();

      await componente['confirmarRemocao']();
      fixture.detectChanges();

      const authService = TestBed.inject(AuthService);
      const usuarios = await authService.listarUsuarios(Role.SUPER);
      expect(usuarios.some((usuario) => usuario.usuario === 'para-remover')).toBe(false);
    });
  });
});
