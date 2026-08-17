import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, convertToParamMap, Router, UrlTree } from '@angular/router';
import { IntentLogin } from '../../shared/models/enums/intent-login.enum';
import { AuthService } from '../../shared/services/auth.service/auth.service';
import { escopoAdminGuard } from './escopo-admin.guard';

describe('escopoAdminGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  function executarGuard(id: string): boolean | UrlTree {
    const route = { paramMap: convertToParamMap({ id }) } as ActivatedRouteSnapshot;
    return TestBed.runInInjectionContext(() => escopoAdminGuard(route, {} as never)) as
      boolean | UrlTree;
  }

  function executarGuardSemId(): boolean | UrlTree {
    const route = { paramMap: convertToParamMap({}) } as ActivatedRouteSnapshot;
    return TestBed.runInInjectionContext(() => escopoAdminGuard(route, {} as never)) as
      boolean | UrlTree;
  }

  it('deve permitir o acesso quando a sessão admin corresponde ao segmento :id da rota', async () => {
    const authService = TestBed.inject(AuthService);
    await authService.autenticar('admin', '123@', IntentLogin.LOGIN);

    const resultado = executarGuard('admin');

    expect(resultado).toBe(true);
  });

  it('deve redirecionar para o próprio painel quando a sessão admin não corresponde ao segmento :id da rota', async () => {
    const authService = TestBed.inject(AuthService);
    const router = TestBed.inject(Router);
    await authService.autenticar('admin', '123@', IntentLogin.LOGIN);

    const resultado = executarGuard('outra-conta') as UrlTree;

    expect(resultado).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(resultado)).toBe('/admin/admin');
  });

  it('deve permitir o acesso de uma sessão super a qualquer segmento :id, sem redirecionar', async () => {
    const authService = TestBed.inject(AuthService);
    await authService.autenticar('superAdmin', '123Super', IntentLogin.LOGIN);

    const resultado = executarGuard('admin');

    expect(resultado).toBe(true);
  });

  describe('rota sem segmento :id (caso de /admin/control)', () => {
    it('deve redirecionar uma sessão admin para o próprio painel, já que ela nunca corresponde a essa rota', async () => {
      const authService = TestBed.inject(AuthService);
      const router = TestBed.inject(Router);
      await authService.autenticar('admin', '123@', IntentLogin.LOGIN);

      const resultado = executarGuardSemId() as UrlTree;

      expect(resultado).toBeInstanceOf(UrlTree);
      expect(router.serializeUrl(resultado)).toBe('/admin/admin');
    });

    it('deve permitir o acesso de uma sessão super, sem redirecionar', async () => {
      const authService = TestBed.inject(AuthService);
      await authService.autenticar('superAdmin', '123Super', IntentLogin.LOGIN);

      const resultado = executarGuardSemId();

      expect(resultado).toBe(true);
    });
  });
});
