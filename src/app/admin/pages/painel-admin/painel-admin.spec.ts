import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { CategoriaNotificacao } from '../../../shared/models/enums/categoria-notificacao.enum';
import { Role } from '../../../shared/models/enums/role.enum';
import { TipoHabilidade } from '../../../shared/models/enums/tipo-habilidade.enum';
import { TipoSolicitacaoHabilidade } from '../../../shared/models/enums/tipo-solicitacao-habilidade.enum';
import { NotificacaoService } from '../../../shared/services/notificacao.service/notificacao.service';
import { SolicitacaoHabilidadeService } from '../../../shared/services/solicitacao-habilidade.service/solicitacao-habilidade.service';
import { autenticarComo } from '../../../shared/testing/autenticar-como';
import { PainelAdmin } from './painel-admin';

describe('PainelAdmin', () => {
  let fixture: ComponentFixture<PainelAdmin>;

  beforeEach(() => {
    localStorage.clear();
    autenticarComo('admin', Role.ADMIN);
    TestBed.configureTestingModule({ imports: [PainelAdmin], providers: [provideRouter([])] });
    fixture = TestBed.createComponent(PainelAdmin);
    fixture.detectChanges();
  });

  afterEach(() => {
    history.replaceState(null, '');
  });

  function linksDePaginas(): HTMLButtonElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.header .header__pagina'));
  }

  it('deve exibir as 3 páginas navegáveis do painel no header', () => {
    expect(linksDePaginas().map((link) => link.textContent?.trim())).toEqual([
      'Página Inicial',
      'Editar Dados',
      'Editar Usuários',
    ]);
  });

  it('deve exibir a página inicial por padrão, sem montar as demais vistas', () => {
    expect(fixture.nativeElement.querySelector('app-pagina-inicial-admin')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-editar-dados')).toBeNull();
    expect(fixture.nativeElement.querySelector('app-editar-usuarios')).toBeNull();
  });

  it('deve trocar para Editar Dados ao clicar no link do header, sem navegar de verdade (mesma URL)', () => {
    const link = linksDePaginas().find((elemento) => elemento.textContent?.trim() === 'Editar Dados')!;

    link.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-editar-dados')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-pagina-inicial-admin')).toBeNull();
  });

  it('deve trocar para Editar Usuários ao clicar no link do header', () => {
    const link = linksDePaginas().find(
      (elemento) => elemento.textContent?.trim() === 'Editar Usuários',
    )!;

    link.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-editar-usuarios')).not.toBeNull();
  });

  it('deve trocar para Editar Dados quando a página inicial emite irParaEditarDados', () => {
    const cartaoEditarDados: HTMLButtonElement = fixture.nativeElement.querySelectorAll(
      '.pagina-inicial-admin__card',
    )[2];

    cartaoEditarDados.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-editar-dados')).not.toBeNull();
  });

  it('deve iniciar direto na vista indicada por history.state.vistaInicial', () => {
    history.replaceState({ vistaInicial: 'editar-usuarios' }, '');

    const novaFixture = TestBed.createComponent(PainelAdmin);
    novaFixture.detectChanges();

    expect(novaFixture.nativeElement.querySelector('app-editar-usuarios')).not.toBeNull();
  });

  it('deve exibir o footer', () => {
    expect(fixture.nativeElement.querySelector('app-footer')).not.toBeNull();
  });

  it('deve definir o título da página e marcar como noindex, nofollow', () => {
    expect(TestBed.inject(Title).getTitle()).toBe('Painel Administrativo | My Landing Page');
    expect(TestBed.inject(Meta).getTag('name="robots"')?.content).toBe('noindex, nofollow');
  });

  describe('solicitações de habilidade', () => {
    it('não deve incluir "solicitacoes" entre as páginas navegáveis do header', () => {
      expect(linksDePaginas().map((link) => link.textContent?.trim())).not.toContain(
        'Solicitações',
      );
    });

    it('deve repassar ao header a quantidade de solicitações pendentes para o admin logado', () => {
      const solicitacaoService = TestBed.inject(SolicitacaoHabilidadeService);
      solicitacaoService.solicitar({
        idPessoa: 1,
        usuarioAdminAlvo: 'admin',
        tipoSolicitacao: TipoSolicitacaoHabilidade.ADICIONAR,
        solicitacao: { habilidade: 'JavaScript', tipo: TipoHabilidade.HARD, usuarioSolicitante: 'user' },
      });
      solicitacaoService.solicitar({
        idPessoa: 2,
        usuarioAdminAlvo: 'outro-admin',
        tipoSolicitacao: TipoSolicitacaoHabilidade.ADICIONAR,
        solicitacao: { habilidade: 'CSS', tipo: TipoHabilidade.HARD, usuarioSolicitante: 'user' },
      });

      const novaFixture = TestBed.createComponent(PainelAdmin);
      novaFixture.detectChanges();

      expect(
        novaFixture.nativeElement.querySelector('.header__badge-notificacoes').textContent.trim(),
      ).toBe('1');
    });

    it('deve atualizar o selo do header automaticamente ao aceitar, sem precisar recarregar a página', () => {
      const solicitacaoService = TestBed.inject(SolicitacaoHabilidadeService);
      solicitacaoService.solicitar({
        idPessoa: 1,
        usuarioAdminAlvo: 'admin',
        tipoSolicitacao: TipoSolicitacaoHabilidade.ADICIONAR,
        solicitacao: { habilidade: 'JavaScript', tipo: TipoHabilidade.HARD, usuarioSolicitante: 'user' },
      });
      fixture = TestBed.createComponent(PainelAdmin);
      fixture.detectChanges();
      expect(
        fixture.nativeElement.querySelector('.header__badge-notificacoes').textContent.trim(),
      ).toBe('1');

      const [pendente] = solicitacaoService.listarPendentesParaAdmin('admin');
      solicitacaoService.aceitar(pendente.id);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.header__badge-notificacoes')).toBeNull();
    });

    it('deve atualizar o selo do header automaticamente ao rejeitar, sem precisar recarregar a página', () => {
      const solicitacaoService = TestBed.inject(SolicitacaoHabilidadeService);
      solicitacaoService.solicitar({
        idPessoa: 1,
        usuarioAdminAlvo: 'admin',
        tipoSolicitacao: TipoSolicitacaoHabilidade.ADICIONAR,
        solicitacao: { habilidade: 'JavaScript', tipo: TipoHabilidade.HARD, usuarioSolicitante: 'user' },
      });
      fixture = TestBed.createComponent(PainelAdmin);
      fixture.detectChanges();

      const [pendente] = solicitacaoService.listarPendentesParaAdmin('admin');
      solicitacaoService.rejeitar(pendente.id);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.header__badge-notificacoes')).toBeNull();
    });

    it('deve abrir a vista de solicitações ao clicar no botão de notificações do header', () => {
      fixture.nativeElement.querySelector('.header__botao-notificacoes').click();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-solicitacoes-habilidade')).not.toBeNull();
      expect(fixture.nativeElement.querySelector('app-pagina-inicial-admin')).toBeNull();
    });

    it('deve atualizar o selo do header ao aceitar pela própria UI da vista de solicitações, no mesmo fixture', async () => {
      jest.useFakeTimers();
      const solicitacaoService = TestBed.inject(SolicitacaoHabilidadeService);
      solicitacaoService.solicitar({
        idPessoa: 1,
        usuarioAdminAlvo: 'admin',
        tipoSolicitacao: TipoSolicitacaoHabilidade.ADICIONAR,
        solicitacao: { habilidade: 'JavaScript', tipo: TipoHabilidade.HARD, usuarioSolicitante: 'user' },
      });
      fixture = TestBed.createComponent(PainelAdmin);
      fixture.detectChanges();

      fixture.nativeElement.querySelector('.header__botao-notificacoes').click();
      fixture.detectChanges();
      expect(
        fixture.nativeElement.querySelector('.header__badge-notificacoes').textContent.trim(),
      ).toBe('1');

      fixture.nativeElement.querySelector('.solicitacoes-habilidade__aceitar').click();
      fixture.detectChanges();
      await jest.advanceTimersByTimeAsync(500);
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.header__badge-notificacoes')).toBeNull();
      jest.useRealTimers();
    });

    it('deve iniciar direto na vista de solicitações quando indicado por history.state.vistaInicial', () => {
      history.replaceState({ vistaInicial: 'solicitacoes' }, '');

      const novaFixture = TestBed.createComponent(PainelAdmin);
      novaFixture.detectChanges();

      expect(novaFixture.nativeElement.querySelector('app-solicitacoes-habilidade')).not.toBeNull();
    });
  });

  describe('notificações (somente super)', () => {
    it('não deve incluir "Notificações" entre as páginas navegáveis do header para uma sessão admin', () => {
      expect(linksDePaginas().map((link) => link.textContent?.trim())).not.toContain(
        'Notificações',
      );
    });

    it('não deve permitir que uma sessão admin alcance a vista de notificações via history.state', () => {
      history.replaceState({ vistaInicial: 'notificacoes' }, '');

      const novaFixture = TestBed.createComponent(PainelAdmin);
      novaFixture.detectChanges();

      expect(novaFixture.nativeElement.querySelector('app-notificacoes-admin')).toBeNull();
      expect(novaFixture.nativeElement.querySelector('app-pagina-inicial-admin')).not.toBeNull();
    });

    describe('sessão super', () => {
      beforeEach(() => {
        localStorage.clear();
        autenticarComo('superAdmin', Role.SUPER);
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({ imports: [PainelAdmin], providers: [provideRouter([])] });
        fixture = TestBed.createComponent(PainelAdmin);
        fixture.detectChanges();
      });

      it('deve incluir "Notificações" como a 4ª página navegável do header', () => {
        expect(linksDePaginas().map((link) => link.textContent?.trim())).toEqual([
          'Página Inicial',
          'Editar Dados',
          'Editar Usuários',
          'Notificações',
        ]);
      });

      it('deve trocar para a vista de Notificações ao clicar no link do header', () => {
        const link = linksDePaginas().find((elemento) => elemento.textContent?.trim() === 'Notificações')!;

        link.click();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('app-notificacoes-admin')).not.toBeNull();
        expect(fixture.nativeElement.querySelector('app-pagina-inicial-admin')).toBeNull();
      });

      it('o selo do sino deve refletir notificações não vistas, e o clique deve abrir a vista de Notificações', () => {
        const notificacaoService = TestBed.inject(NotificacaoService);
        notificacaoService.criar({
          categoria: CategoriaNotificacao.LOG,
          status: null,
          usuarioOrigem: 'novo-usuario',
          usuarioDestino: null,
          vista: false,
          notificacao: { titulo: 'Novo usuário cadastrado', descricao: 'desc' },
        });
        fixture = TestBed.createComponent(PainelAdmin);
        fixture.detectChanges();

        expect(
          fixture.nativeElement.querySelector('.header__badge-notificacoes').textContent.trim(),
        ).toBe('1');

        fixture.nativeElement.querySelector('.header__botao-notificacoes').click();
        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('app-notificacoes-admin')).not.toBeNull();
        expect(
          fixture.nativeElement.querySelector('.header__badge-notificacoes'),
        ).toBeNull();
      });
    });
  });
});
