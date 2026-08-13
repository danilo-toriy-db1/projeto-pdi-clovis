import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { IntentLogin } from '../models/enums/intent-login.enum';
import { AuthService } from '../services/auth.service/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  function executarGuard(): boolean | UrlTree {
    return TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/admin/qualquer' } as never),
    ) as boolean | UrlTree;
  }

  it('deve bloquear o acesso quando não há nenhuma sessão ativa', () => {
    const resultado = executarGuard();

    expect(resultado).not.toBe(true);
    expect((resultado as UrlTree).toString()).toContain('/login');
  });

  it('deve bloquear o acesso quando a sessão ativa tem role user', async () => {
    const authService = TestBed.inject(AuthService);
    await authService.autenticar('user', '123U', IntentLogin.LOGIN);

    const resultado = executarGuard();

    expect(resultado).not.toBe(true);
    expect((resultado as UrlTree).toString()).toContain('/login');
    expect((resultado as UrlTree).toString()).toContain('acessoNegado');
  });

  it('deve permitir o acesso quando a sessão ativa tem role admin', async () => {
    const authService = TestBed.inject(AuthService);
    await authService.autenticar('admin', '123@', IntentLogin.LOGIN);

    const resultado = executarGuard();

    expect(resultado).toBe(true);
  });

  it('deve permitir o acesso quando a sessão ativa tem role super', async () => {
    const authService = TestBed.inject(AuthService);
    await authService.autenticar('superAdmin', '123Super', IntentLogin.LOGIN);

    const resultado = executarGuard();

    expect(resultado).toBe(true);
  });

  it('injeta o Router corretamente para construir a árvore de redirecionamento', () => {
    const router = TestBed.inject(Router);
    const resultado = executarGuard() as UrlTree;

    expect(resultado).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(resultado)).toContain('/login');
  });
});
