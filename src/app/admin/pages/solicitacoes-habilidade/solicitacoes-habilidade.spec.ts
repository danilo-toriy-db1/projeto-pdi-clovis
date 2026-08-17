import { ComponentFixture, TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { Role } from '../../../shared/models/enums/role.enum';
import { TipoHabilidade } from '../../../shared/models/enums/tipo-habilidade.enum';
import { TipoSolicitacaoHabilidade } from '../../../shared/models/enums/tipo-solicitacao-habilidade.enum';
import { HabilidadeService } from '../../../shared/services/habilidade.service/habilidade.service';
import { SolicitacaoHabilidadeService } from '../../../shared/services/solicitacao-habilidade.service/solicitacao-habilidade.service';
import { autenticarComo } from '../../../shared/testing/autenticar-como';
import { SolicitacoesHabilidade } from './solicitacoes-habilidade';

describe('SolicitacoesHabilidade', () => {
  let fixture: ComponentFixture<SolicitacoesHabilidade>;
  let solicitacaoService: SolicitacaoHabilidadeService;

  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
    TestBed.configureTestingModule({ imports: [SolicitacoesHabilidade] });
    solicitacaoService = TestBed.inject(SolicitacaoHabilidadeService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  function criarComponente(): void {
    fixture = TestBed.createComponent(SolicitacoesHabilidade);
    fixture.detectChanges();
  }

  function cards(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('.solicitacoes-habilidade__card'));
  }

  describe('isolamento entre admins', () => {
    beforeEach(() => {
      solicitacaoService.solicitar({
        idPessoa: 1,
        usuarioAdminAlvo: 'admin-1',
        tipoSolicitacao: TipoSolicitacaoHabilidade.ADICIONAR,
        solicitacao: { habilidade: 'JavaScript', tipo: TipoHabilidade.HARD, usuarioSolicitante: 'user' },
      });
      solicitacaoService.solicitar({
        idPessoa: 2,
        usuarioAdminAlvo: 'admin-2',
        tipoSolicitacao: TipoSolicitacaoHabilidade.ADICIONAR,
        solicitacao: { habilidade: 'CSS', tipo: TipoHabilidade.HARD, usuarioSolicitante: 'user' },
      });
    });

    it('deve exibir apenas as solicitações destinadas ao admin logado, nunca as de outro admin', () => {
      autenticarComo('admin-1', Role.ADMIN);
      criarComponente();

      expect(cards()).toHaveLength(1);
      expect(fixture.nativeElement.textContent).toContain('JavaScript');
      expect(fixture.nativeElement.textContent).not.toContain('CSS');
    });

    it('deve exibir todas as solicitações, de qualquer admin, para a sessão super', () => {
      autenticarComo('superAdmin', Role.SUPER);
      criarComponente();

      expect(cards()).toHaveLength(2);
      expect(fixture.nativeElement.textContent).toContain('JavaScript');
      expect(fixture.nativeElement.textContent).toContain('CSS');
      expect(fixture.nativeElement.textContent).toContain('admin-1');
      expect(fixture.nativeElement.textContent).toContain('admin-2');
    });

    it('não deve exibir o admin alvo de cada solicitação para uma sessão admin comum', () => {
      autenticarComo('admin-1', Role.ADMIN);
      criarComponente();

      expect(fixture.nativeElement.querySelector('.solicitacoes-habilidade__alvo')).toBeNull();
    });
  });

  it('deve exibir a mensagem de lista vazia quando não houver nenhuma solicitação pendente', () => {
    autenticarComo('admin-1', Role.ADMIN);
    criarComponente();

    expect(fixture.nativeElement.textContent).toContain('Nenhuma solicitação pendente');
  });

  describe('aceitar', () => {
    beforeEach(() => {
      autenticarComo('admin-1', Role.ADMIN);
      solicitacaoService.solicitar({
        idPessoa: 5,
        usuarioAdminAlvo: 'admin-1',
        tipoSolicitacao: TipoSolicitacaoHabilidade.ADICIONAR,
        solicitacao: { habilidade: 'JavaScript', tipo: TipoHabilidade.HARD, usuarioSolicitante: 'user' },
      });
      criarComponente();
    });

    it('deve exibir carregando e depois sucesso, aplicando a habilidade e removendo o card', async () => {
      fixture.nativeElement.querySelector('.solicitacoes-habilidade__aceitar').click();
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('app-feedback-modal')).not.toBeNull();

      await jest.advanceTimersByTimeAsync(500);
      fixture.detectChanges();

      const habilidadeService = TestBed.inject(HabilidadeService);
      expect(habilidadeService.listarPorId(5)).toHaveLength(1);

      await jest.advanceTimersByTimeAsync(1000);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-feedback-modal')).toBeNull();
      expect(cards()).toHaveLength(0);
    });
  });

  describe('rejeitar', () => {
    beforeEach(() => {
      autenticarComo('admin-1', Role.ADMIN);
      solicitacaoService.solicitar({
        idPessoa: 5,
        usuarioAdminAlvo: 'admin-1',
        tipoSolicitacao: TipoSolicitacaoHabilidade.ADICIONAR,
        solicitacao: { habilidade: 'JavaScript', tipo: TipoHabilidade.HARD, usuarioSolicitante: 'user' },
      });
      criarComponente();
    });

    it('deve remover a solicitação da fila sem criar a habilidade', async () => {
      fixture.nativeElement.querySelector('.solicitacoes-habilidade__rejeitar').click();
      fixture.detectChanges();

      await jest.advanceTimersByTimeAsync(500);
      await jest.advanceTimersByTimeAsync(1000);
      fixture.detectChanges();

      const habilidadeService = TestBed.inject(HabilidadeService);
      expect(habilidadeService.listarPorId(5)).toEqual([]);
      expect(cards()).toHaveLength(0);
    });
  });

  it('não deve ter violações de acessibilidade com solicitações renderizadas', async () => {
    autenticarComo('superAdmin', Role.SUPER);
    solicitacaoService.solicitar({
      idPessoa: 5,
      usuarioAdminAlvo: 'admin-1',
      tipoSolicitacao: TipoSolicitacaoHabilidade.REMOVER,
      solicitacao: { habilidade: 'JavaScript', tipo: TipoHabilidade.HARD, usuarioSolicitante: 'user' },
    });
    jest.useRealTimers();
    criarComponente();

    const resultados = await axe(fixture.nativeElement);
    expect(resultados).toHaveNoViolations();
  });
});
