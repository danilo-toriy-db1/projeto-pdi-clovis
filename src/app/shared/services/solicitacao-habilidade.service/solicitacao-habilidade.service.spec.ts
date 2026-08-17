import { computed } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CategoriaNotificacao } from '../../models/enums/categoria-notificacao.enum';
import { Role } from '../../models/enums/role.enum';
import { StatusNotificacao } from '../../models/enums/status-notificacao.enum';
import { TipoHabilidade } from '../../models/enums/tipo-habilidade.enum';
import { TipoSolicitacaoHabilidade } from '../../models/enums/tipo-solicitacao-habilidade.enum';
import { ArraySolicitacoesHabilidadeModel } from '../../models/interfaces/solicitacao-habilidade.interface';
import { HabilidadeService } from '../habilidade.service/habilidade.service';
import { NotificacaoService } from '../notificacao.service/notificacao.service';
import { SolicitacaoHabilidadeService } from './solicitacao-habilidade.service';

function solicitacaoDeTeste(
  sobrescritas: Partial<Omit<ArraySolicitacoesHabilidadeModel, 'id' | 'notificacaoId'>> = {},
): Omit<ArraySolicitacoesHabilidadeModel, 'id' | 'notificacaoId'> {
  return {
    idPessoa: 1,
    usuarioAdminAlvo: 'admin-1',
    tipoSolicitacao: TipoSolicitacaoHabilidade.ADICIONAR,
    solicitacao: {
      habilidade: 'JavaScript',
      tipo: TipoHabilidade.HARD,
      usuarioSolicitante: 'user',
    },
    ...sobrescritas,
  };
}

describe('SolicitacaoHabilidadeService', () => {
  let servico: SolicitacaoHabilidadeService;
  let habilidadeService: HabilidadeService;
  let notificacaoService: NotificacaoService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    servico = TestBed.inject(SolicitacaoHabilidadeService);
    habilidadeService = TestBed.inject(HabilidadeService);
    notificacaoService = TestBed.inject(NotificacaoService);
  });

  it('deve registrar uma solicitação com um id novo', () => {
    servico.solicitar(solicitacaoDeTeste());
    servico.solicitar(solicitacaoDeTeste({ usuarioAdminAlvo: 'admin-2' }));

    const todas = servico.listarTodasPendentes();
    expect(todas).toHaveLength(2);
    expect(todas[1].id).toBeGreaterThan(todas[0].id);
  });

  describe('isolamento entre admins', () => {
    it('não deve permitir que o admin 2 veja a solicitação enviada para o admin 1', () => {
      servico.solicitar(solicitacaoDeTeste({ usuarioAdminAlvo: 'admin-1' }));

      expect(servico.listarPendentesParaAdmin('admin-1')).toHaveLength(1);
      expect(servico.listarPendentesParaAdmin('admin-2')).toHaveLength(0);
    });

    it('o super deve ver todas as solicitações, independente do admin alvo', () => {
      servico.solicitar(solicitacaoDeTeste({ usuarioAdminAlvo: 'admin-1' }));
      servico.solicitar(solicitacaoDeTeste({ usuarioAdminAlvo: 'admin-2' }));

      expect(servico.listarTodasPendentes()).toHaveLength(2);
    });
  });

  describe('listarPendentesParaSessao', () => {
    beforeEach(() => {
      servico.solicitar(solicitacaoDeTeste({ usuarioAdminAlvo: 'admin-1' }));
      servico.solicitar(solicitacaoDeTeste({ usuarioAdminAlvo: 'admin-2' }));
    });

    it('deve devolver array vazio quando não há sessão', () => {
      expect(servico.listarPendentesParaSessao(null)).toEqual([]);
    });

    it('deve filtrar por usuarioAdminAlvo quando a sessão é admin', () => {
      const resultado = servico.listarPendentesParaSessao({ usuario: 'admin-1', role: Role.ADMIN });

      expect(resultado).toHaveLength(1);
      expect(resultado[0].usuarioAdminAlvo).toBe('admin-1');
    });

    it('deve devolver todas as solicitações quando a sessão é super', () => {
      const resultado = servico.listarPendentesParaSessao({
        usuario: 'superAdmin',
        role: Role.SUPER,
      });

      expect(resultado).toHaveLength(2);
    });
  });

  describe('aceitar', () => {
    it('deve criar a habilidade e remover a solicitação da fila ao aceitar um pedido de adição', () => {
      servico.solicitar(solicitacaoDeTeste());
      const [pendente] = servico.listarTodasPendentes();

      const aceito = servico.aceitar(pendente.id);

      expect(aceito).toBe(true);
      expect(habilidadeService.listarPorId(1)).toEqual([
        { id: 1, habilidade: { habilidade: 'JavaScript', tipo: TipoHabilidade.HARD, icone: 'placeholder.svg' } },
      ]);
      expect(servico.listarTodasPendentes()).toEqual([]);
    });

    it('deve remover a habilidade correspondente e a solicitação da fila ao aceitar um pedido de remoção', () => {
      habilidadeService.criar(1, { habilidade: 'JavaScript', tipo: TipoHabilidade.HARD, icone: '' });
      servico.solicitar(
        solicitacaoDeTeste({ tipoSolicitacao: TipoSolicitacaoHabilidade.REMOVER }),
      );
      const [pendente] = servico.listarTodasPendentes();

      const aceito = servico.aceitar(pendente.id);

      expect(aceito).toBe(true);
      expect(habilidadeService.listarPorId(1)).toEqual([]);
      expect(servico.listarTodasPendentes()).toEqual([]);
    });

    it('deve apenas descartar a solicitação de remoção quando a habilidade alvo já não existe mais', () => {
      servico.solicitar(
        solicitacaoDeTeste({ tipoSolicitacao: TipoSolicitacaoHabilidade.REMOVER }),
      );
      const [pendente] = servico.listarTodasPendentes();

      const aceito = servico.aceitar(pendente.id);

      expect(aceito).toBe(true);
      expect(servico.listarTodasPendentes()).toEqual([]);
    });

    it('deve devolver false ao tentar aceitar um id que não existe mais', () => {
      expect(servico.aceitar(999)).toBe(false);
    });
  });

  describe('reatividade (signal)', () => {
    it('deve atualizar um computed() dependente sem precisar recriar o componente/serviço após aceitar', () => {
      servico.solicitar(solicitacaoDeTeste());
      const contador = computed(() => servico.listarPendentesParaAdmin('admin-1').length);
      expect(contador()).toBe(1);

      const [pendente] = servico.listarPendentesParaAdmin('admin-1');
      servico.aceitar(pendente.id);

      expect(contador()).toBe(0);
    });

    it('deve atualizar um computed() dependente sem precisar recriar o componente/serviço após rejeitar', () => {
      servico.solicitar(solicitacaoDeTeste());
      const contador = computed(() => servico.listarTodasPendentes().length);
      expect(contador()).toBe(1);

      const [pendente] = servico.listarTodasPendentes();
      servico.rejeitar(pendente.id);

      expect(contador()).toBe(0);
    });

    it('deve atualizar um computed() dependente imediatamente após uma nova solicitação', () => {
      const contador = computed(() => servico.listarTodasPendentes().length);
      expect(contador()).toBe(0);

      servico.solicitar(solicitacaoDeTeste());

      expect(contador()).toBe(1);
    });
  });

  describe('rejeitar', () => {
    it('deve remover a solicitação da fila sem aplicar nenhuma alteração de habilidade', () => {
      servico.solicitar(solicitacaoDeTeste());
      const [pendente] = servico.listarTodasPendentes();

      servico.rejeitar(pendente.id);

      expect(servico.listarTodasPendentes()).toEqual([]);
      expect(habilidadeService.listarPorId(1)).toEqual([]);
    });
  });

  describe('log de notificações do sistema', () => {
    it('deve registrar uma notificação SISTEMA pendente ao solicitar, com origem e destino corretos', () => {
      servico.solicitar(solicitacaoDeTeste());

      const notificacoes = notificacaoService.listarPorCategoria(CategoriaNotificacao.SISTEMA);
      expect(notificacoes).toHaveLength(1);
      expect(notificacoes[0].status).toBe(StatusNotificacao.PENDENTE);
      expect(notificacoes[0].usuarioOrigem).toBe('user');
      expect(notificacoes[0].usuarioDestino).toBe('admin-1');
    });

    it('deve atualizar a notificação correlata para aprovada ao aceitar, sem removê-la', () => {
      servico.solicitar(solicitacaoDeTeste());
      const [pendente] = servico.listarTodasPendentes();

      servico.aceitar(pendente.id);

      const [notificacao] = notificacaoService.listarPorCategoria(CategoriaNotificacao.SISTEMA);
      expect(notificacao.status).toBe(StatusNotificacao.APROVADA);
    });

    it('deve atualizar a notificação correlata para rejeitada ao rejeitar, sem removê-la', () => {
      servico.solicitar(solicitacaoDeTeste());
      const [pendente] = servico.listarTodasPendentes();

      servico.rejeitar(pendente.id);

      const [notificacao] = notificacaoService.listarPorCategoria(CategoriaNotificacao.SISTEMA);
      expect(notificacao.status).toBe(StatusNotificacao.REJEITADA);
    });
  });
});
