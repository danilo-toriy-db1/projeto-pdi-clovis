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

  beforeEach(() => {
    localStorage.clear();
  });

  it('deve renderizar o header com as 4 páginas e o router-outlet quando o id existe', () => {
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

    const links: HTMLAnchorElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.header .header__pagina'),
    );
    expect(links.map((link) => link.textContent?.trim())).toEqual([
      'Página Inicial',
      'Sobre Mim',
      'Habilidades',
      'Contato e Sobre',
    ]);
    expect(fixture.nativeElement.querySelector('router-outlet, main')).not.toBeNull();
    expect(
      fixture.nativeElement.querySelector('.landing-page-nao-encontrada'),
    ).toBeNull();
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
