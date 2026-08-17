import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { CategoriaNotificacao } from '../../../shared/models/enums/categoria-notificacao.enum';
import { Role } from '../../../shared/models/enums/role.enum';
import { NotificacaoService } from '../../../shared/services/notificacao.service/notificacao.service';
import { PessoaService } from '../../../shared/services/pessoa.service/pessoa.service';
import { autenticarComo } from '../../../shared/testing/autenticar-como';
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

  describe('SEO', () => {
    it('deve definir o título com o nome da pessoa e marcar como indexável quando o id existe', () => {
      TestBed.configureTestingModule({});
      const servico = TestBed.inject(PessoaService);
      const entrada = servico.criarNova({
        nome: 'Fulano',
        idade: 30,
        carreira: 'TI',
        profissao: 'Desenvolvedor',
        empresa: 'DB1',
        imagem: '',
        descricao: { biografia: '', hobbies: '', desgostos: '', objetivos: '' },
      });

      configurar(String(entrada.id));

      expect(TestBed.inject(Title).getTitle()).toBe('Fulano | My Landing Page');
      expect(TestBed.inject(Meta).getTag('name="robots"')?.content).toBe('index, follow');
      expect(TestBed.inject(Meta).getTag('name="description"')?.content).toContain(
        'Desenvolvedor na DB1',
      );
    });

    it('deve definir o título de não encontrada e marcar como noindex quando o id não existe', () => {
      configurar('999');

      expect(TestBed.inject(Title).getTitle()).toBe('Página não encontrada | My Landing Page');
      expect(TestBed.inject(Meta).getTag('name="robots"')?.content).toBe('noindex, nofollow');
    });
  });

  describe('botão de notificações no header', () => {
    function criarPessoaDeTeste() {
      TestBed.configureTestingModule({});
      return TestBed.inject(PessoaService).criarNova({
        nome: 'Fulano',
        idade: 30,
        carreira: 'TI',
        profissao: 'Dev',
        empresa: 'DB1',
        imagem: '',
        descricao: { biografia: '', hobbies: '', desgostos: '', objetivos: '' },
      });
    }

    it('deve navegar para /admin/{usuario} com vistaInicial "solicitacoes" para uma sessão admin', () => {
      const entrada = criarPessoaDeTeste();
      autenticarComo('admin-1', Role.ADMIN);
      const fixture = configurar(String(entrada.id));
      const router = TestBed.inject(Router);
      const espiao = jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

      fixture.nativeElement.querySelector('.header__botao-notificacoes').click();

      expect(espiao).toHaveBeenCalledWith('/admin/admin-1', {
        state: { vistaInicial: 'solicitacoes' },
      });
    });

    it('deve navegar para /admin/control com vistaInicial "notificacoes" para uma sessão super', () => {
      const entrada = criarPessoaDeTeste();
      autenticarComo('superAdmin', Role.SUPER);
      const fixture = configurar(String(entrada.id));
      const router = TestBed.inject(Router);
      const espiao = jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

      fixture.nativeElement.querySelector('.header__botao-notificacoes').click();

      expect(espiao).toHaveBeenCalledWith('/admin/control', {
        state: { vistaInicial: 'notificacoes' },
      });
    });

    it('não deve exibir o botão de notificações para um visitante não autenticado', () => {
      const entrada = criarPessoaDeTeste();
      const fixture = configurar(String(entrada.id));

      expect(fixture.nativeElement.querySelector('.header__botao-notificacoes')).toBeNull();
    });

    it('para uma sessão super, o selo deve refletir notificações não vistas, não solicitações pendentes', () => {
      const entrada = criarPessoaDeTeste();
      autenticarComo('superAdmin', Role.SUPER);
      const notificacaoService = TestBed.inject(NotificacaoService);
      notificacaoService.criar({
        categoria: CategoriaNotificacao.LOG,
        status: null,
        usuarioOrigem: 'novo-usuario',
        usuarioDestino: null,
        vista: false,
        notificacao: { titulo: 'Novo usuário cadastrado', descricao: 'desc' },
      });

      const fixture = configurar(String(entrada.id));

      expect(
        fixture.nativeElement.querySelector('.header__badge-notificacoes').textContent.trim(),
      ).toBe('1');
    });
  });
});
