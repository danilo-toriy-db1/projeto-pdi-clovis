import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AboutModel } from '../shared/models/interfaces/about.model';
import { PessoaService } from '../shared/services/pessoa.service/pessoa.service';
import { LANDING_PAGE_ROUTES } from './landing-page.routes';

function dadosDeTeste(): AboutModel {
  return {
    nome: 'Fulano',
    idade: 30,
    carreira: 'TI',
    profissao: 'Desenvolvedor',
    empresa: 'DB1',
    imagem: '',
    descricao: { biografia: '', hobbies: '', desgostos: '', objetivos: '' },
  };
}

describe('LANDING_PAGE_ROUTES', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter(LANDING_PAGE_ROUTES)],
    });
  });

  it('troca de vista pelo header sem navegar de verdade, preservando o id na URL', async () => {
    const pessoaService = TestBed.inject(PessoaService);
    const entrada = pessoaService.criarNova(dadosDeTeste());
    const router = TestBed.inject(Router);

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(`/${entrada.id}`);

    const clicarEm = async (rotulo: string) => {
      const link = Array.from(
        harness.routeNativeElement!.querySelectorAll<HTMLAnchorElement>('.header__pagina'),
      ).find((elemento) => elemento.textContent?.trim() === rotulo)!;
      link.click();
      await harness.fixture.whenStable();
    };

    await clicarEm('Habilidades');
    expect(router.url).toBe(`/${entrada.id}`);
    expect(harness.routeNativeElement!.querySelector('app-habilidades-landing')).not.toBeNull();

    await clicarEm('Contato e Sobre');
    expect(router.url).toBe(`/${entrada.id}`);
    expect(harness.routeNativeElement!.querySelector('app-contato-e-sobre')).not.toBeNull();

    await clicarEm('Página Inicial');
    expect(router.url).toBe(`/${entrada.id}`);
    expect(harness.routeNativeElement!.querySelector('app-pagina-inicial-landing')).not.toBeNull();
  });

  it('rota control é resolvida como a rota exclusiva do super, nunca como um id "control"', async () => {
    const router = TestBed.inject(Router);
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/control');

    expect(router.url).toBe('/control');
    expect(harness.routeNativeElement!.querySelector('.landing-page-nao-encontrada')).not.toBeNull();
  });

  it('rota sem id exibe a página de URL inválida', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/');

    expect(harness.routeNativeElement!.textContent).toContain('URL inválida');
  });
});
