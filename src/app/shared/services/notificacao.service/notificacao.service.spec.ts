import { computed } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CategoriaNotificacao } from '../../models/enums/categoria-notificacao.enum';
import { StatusNotificacao } from '../../models/enums/status-notificacao.enum';
import { ArrayNotificacaoModel } from '../../models/interfaces/notificacao.interface';
import { NotificacaoService } from './notificacao.service';

function notificacaoDeTeste(
  sobrescritas: Partial<Omit<ArrayNotificacaoModel, 'id'>> = {},
): Omit<ArrayNotificacaoModel, 'id'> {
  return {
    categoria: CategoriaNotificacao.SISTEMA,
    status: StatusNotificacao.PENDENTE,
    usuarioOrigem: 'user',
    usuarioDestino: 'admin',
    vista: false,
    notificacao: {
      titulo: 'Nova solicitação',
      descricao: 'Descrição de teste',
    },
    ...sobrescritas,
  };
}

describe('NotificacaoService', () => {
  let servico: NotificacaoService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    servico = TestBed.inject(NotificacaoService);
  });

  it('deve começar sem nenhuma notificação quando o armazenamento está vazio', () => {
    expect(servico.listarTodas()).toEqual([]);
  });

  it('deve registrar uma notificação com um id novo e devolver o registro criado', () => {
    servico.criar(notificacaoDeTeste());
    const criada = servico.criar(notificacaoDeTeste());

    const todas = servico.listarTodas();
    expect(todas).toHaveLength(2);
    expect(todas[1].id).toBeGreaterThan(todas[0].id);
    expect(criada.id).toBe(todas[1].id);
  });

  it('deve filtrar notificações por categoria', () => {
    servico.criar(notificacaoDeTeste({ categoria: CategoriaNotificacao.SISTEMA }));
    servico.criar(
      notificacaoDeTeste({
        categoria: CategoriaNotificacao.LOG,
        status: null,
        usuarioDestino: null,
      }),
    );

    expect(servico.listarPorCategoria(CategoriaNotificacao.SISTEMA)).toHaveLength(1);
    expect(servico.listarPorCategoria(CategoriaNotificacao.LOG)).toHaveLength(1);
  });

  it('deve atualizar o status de uma notificação sem removê-la da lista', () => {
    servico.criar(notificacaoDeTeste());
    const [pendente] = servico.listarTodas();

    servico.atualizarStatus(pendente.id, StatusNotificacao.APROVADA);

    const [atualizada] = servico.listarTodas();
    expect(atualizada.status).toBe(StatusNotificacao.APROVADA);
    expect(servico.listarTodas()).toHaveLength(1);
  });

  it('não deve alterar nada ao atualizar o status de um id que não existe', () => {
    servico.criar(notificacaoDeTeste());

    servico.atualizarStatus(999, StatusNotificacao.REJEITADA);

    expect(servico.listarTodas()[0].status).toBe(StatusNotificacao.PENDENTE);
  });

  it('deve contar apenas as notificações não vistas', () => {
    servico.criar(notificacaoDeTeste({ vista: false }));
    servico.criar(notificacaoDeTeste({ vista: true }));
    servico.criar(notificacaoDeTeste({ vista: false }));

    expect(servico.contarNaoVistas()).toBe(2);
  });

  it('deve marcar todas as notificações como vistas', () => {
    servico.criar(notificacaoDeTeste({ vista: false }));
    servico.criar(notificacaoDeTeste({ vista: false }));

    servico.marcarTodasComoVistas();

    expect(servico.contarNaoVistas()).toBe(0);
    expect(servico.listarTodas().every((item) => item.vista)).toBe(true);
  });

  it('deve atualizar um computed() dependente sem precisar recriar o serviço após marcar como vistas', () => {
    servico.criar(notificacaoDeTeste({ vista: false }));
    const contador = computed(() => servico.contarNaoVistas());
    expect(contador()).toBe(1);

    servico.marcarTodasComoVistas();

    expect(contador()).toBe(0);
  });
});
