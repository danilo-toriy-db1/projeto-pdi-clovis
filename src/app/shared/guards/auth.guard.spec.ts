import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { IntentLogin } from '../models/enums/intent-login.enum';
import { AuthService } from '../services/auth.service/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
  });

  function executarGuard(): boolean {
    return TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/admin/qualquer' } as never),
    ) as boolean;
  }

  it('deve bloquear o acesso e redirecionar para /login via state (sem query param) quando não há nenhuma sessão ativa', () => {
    const resultado = executarGuard();

    expect(resultado).toBe(false);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login', {
      state: { acessoNegado: true },
    });
  });

  it('deve bloquear o acesso e redirecionar da mesma forma quando a sessão ativa tem role user', async () => {
    const authService = TestBed.inject(AuthService);
    await authService.autenticar('user', '123U', IntentLogin.LOGIN);

    const resultado = executarGuard();

    expect(resultado).toBe(false);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/login', {
      state: { acessoNegado: true },
    });
  });

  it('deve permitir o acesso quando a sessão ativa tem role admin', async () => {
    const authService = TestBed.inject(AuthService);
    await authService.autenticar('admin', '123@', IntentLogin.LOGIN);

    const resultado = executarGuard();

    expect(resultado).toBe(true);
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('deve permitir o acesso quando a sessão ativa tem role super', async () => {
    const authService = TestBed.inject(AuthService);
    await authService.autenticar('superAdmin', '123Super', IntentLogin.LOGIN);

    const resultado = executarGuard();

    expect(resultado).toBe(true);
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
