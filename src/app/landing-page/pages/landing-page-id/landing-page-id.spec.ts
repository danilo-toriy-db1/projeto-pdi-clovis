import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { PessoaService } from '../../../shared/services/pessoa.service/pessoa.service';
import { LandingPageId } from './landing-page-id';

describe('LandingPageId', () => {
  function configurar(id: string): ComponentFixture<LandingPageId> {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [LandingPageId],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id }) } },
        },
      ],
    });

    const fixture = TestBed.createComponent(LandingPageId);
    fixture.detectChanges();
    return fixture;
  }

  function linksDePaginas(fixture: ComponentFixture<LandingPageId>): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.header .header__pagina'));
  }

  beforeEach(() => {
    localStorage.clear();
  });

  it('deve renderizar o header com as 4 páginas e a página inicial por padrão quando o id existe', () => {
    TestBed.configureTestingModule({});
    const servico = TestBed.inject(PessoaService);
    const entrada = servico.criarNova({
      nome: 'Fulano',
      idade: 30,
      carreira: 'TI',
      profissao: 'Dev',
      empresa: 'DB1',
      imagem: '',
      descricao: { biografia: '', hobbies: '', desgostos: '', objetivos: '' },
    });

    const fixture = configurar(String(entrada.id));

    expect(linksDePaginas(fixture).map((link) => link.textContent?.trim())).toEqual([
      'Página Inicial',
      'Sobre Mim',
      'Habilidades',
      'Contato e Sobre',
    ]);
    expect(fixture.nativeElement.querySelector('app-pagina-inicial-landing')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.landing-page-nao-encontrada')).toBeNull();
  });

  it('deve trocar de vista pelo header sem navegar de verdade (mesma URL, o id nunca é perdido)', () => {
    TestBed.configureTestingModule({});
    const servico = TestBed.inject(PessoaService);
    const entrada = servico.criarNova({
      nome: 'Fulano',
      idade: 30,
      carreira: 'TI',
      profissao: 'Dev',
      empresa: 'DB1',
      imagem: '',
      descricao: { biografia: '', hobbies: '', desgostos: '', objetivos: '' },
    });

    const fixture = configurar(String(entrada.id));

    const clicarEm = (rotulo: string) => {
      linksDePaginas(fixture).find((link) => link.textContent?.trim() === rotulo)!.click();
      fixture.detectChanges();
    };

    clicarEm('Sobre Mim');
    expect(fixture.nativeElement.querySelector('app-sobre-mim')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Fulano');

    clicarEm('Habilidades');
    expect(fixture.nativeElement.querySelector('app-habilidades-landing')).not.toBeNull();

    clicarEm('Contato e Sobre');
    expect(fixture.nativeElement.querySelector('app-contato-e-sobre')).not.toBeNull();

    clicarEm('Página Inicial');
    expect(fixture.nativeElement.querySelector('app-pagina-inicial-landing')).not.toBeNull();
  });

  it('deve exibir o footer apenas quando o id existe', () => {
    TestBed.configureTestingModule({});
    const servico = TestBed.inject(PessoaService);
    const entrada = servico.criarNova({
      nome: 'Fulano',
      idade: 30,
      carreira: 'TI',
      profissao: 'Dev',
      empresa: 'DB1',
      imagem: '',
      descricao: { biografia: '', hobbies: '', desgostos: '', objetivos: '' },
    });

    const fixture = configurar(String(entrada.id));

    expect(fixture.nativeElement.querySelector('app-footer')).not.toBeNull();
  });

  it('deve renderizar a página de não encontrada quando o id não corresponde a nenhuma entrada', () => {
    const fixture = configurar('999');

    expect(fixture.nativeElement.querySelector('.landing-page-nao-encontrada')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.header')).toBeNull();
  });

  it('deve renderizar a página de não encontrada quando o id não é numérico', () => {
    const fixture = configurar('abc');

    expect(fixture.nativeElement.querySelector('.landing-page-nao-encontrada')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.header')).toBeNull();
  });
});
