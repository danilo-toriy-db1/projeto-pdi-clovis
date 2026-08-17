import { Injectable, inject, signal } from '@angular/core';
import { CategoriaNotificacao } from '../../models/enums/categoria-notificacao.enum';
import { Role } from '../../models/enums/role.enum';
import { StatusNotificacao } from '../../models/enums/status-notificacao.enum';
import { TipoSolicitacaoHabilidade } from '../../models/enums/tipo-solicitacao-habilidade.enum';
import { Sessao } from '../../models/interfaces/sessao.interface';
import { ArraySolicitacoesHabilidadeModel } from '../../models/interfaces/solicitacao-habilidade.interface';
import { HabilidadeService } from '../habilidade.service/habilidade.service';
import { LocalStorageArrayStore } from '../local-storage-array.store/local-storage-array.store';
import { NotificacaoService } from '../notificacao.service/notificacao.service';

const CHAVE_SOLICITACOES = 'admin.solicitacoes-habilidade';

@Injectable({ providedIn: 'root' })
export class SolicitacaoHabilidadeService {
  private readonly store = inject(LocalStorageArrayStore);
  private readonly habilidadeService = inject(HabilidadeService);
  private readonly notificacaoService = inject(NotificacaoService);
  private readonly solicitacoesSignal = signal<ArraySolicitacoesHabilidadeModel[]>(
    this.store.ler<ArraySolicitacoesHabilidadeModel>(CHAVE_SOLICITACOES),
  );

  solicitar(dados: Omit<ArraySolicitacoesHabilidadeModel, 'id' | 'notificacaoId'>): void {
    const acao = dados.tipoSolicitacao === TipoSolicitacaoHabilidade.ADICIONAR ? 'adicionar' : 'remover';
    const notificacao = this.notificacaoService.criar({
      categoria: CategoriaNotificacao.SISTEMA,
      status: StatusNotificacao.PENDENTE,
      usuarioOrigem: dados.solicitacao.usuarioSolicitante,
      usuarioDestino: dados.usuarioAdminAlvo,
      vista: false,
      notificacao: {
        titulo: `Sugestão de habilidade: ${dados.solicitacao.habilidade}`,
        descricao:
          `${dados.solicitacao.usuarioSolicitante} solicitou ${acao} a habilidade ` +
          `"${dados.solicitacao.habilidade}" (${dados.solicitacao.tipo})` +
          `${dados.usuarioAdminAlvo ? ` para ${dados.usuarioAdminAlvo}` : ''}.`,
      },
    });

    const solicitacoes = this.solicitacoesSignal();
    this.persistir([
      ...solicitacoes,
      { id: this.store.proximoId(solicitacoes), notificacaoId: notificacao.id, ...dados },
    ]);
  }

  listarPendentesParaAdmin(usuarioAdmin: string): ArraySolicitacoesHabilidadeModel[] {
    return this.solicitacoesSignal().filter((entrada) => entrada.usuarioAdminAlvo === usuarioAdmin);
  }

  listarTodasPendentes(): ArraySolicitacoesHabilidadeModel[] {
    return this.solicitacoesSignal();
  }

  listarPendentesParaSessao(sessao: Sessao | null): ArraySolicitacoesHabilidadeModel[] {
    if (!sessao) {
      return [];
    }

    return sessao.role === Role.SUPER
      ? this.listarTodasPendentes()
      : this.listarPendentesParaAdmin(sessao.usuario);
  }

  aceitar(id: number): boolean {
    const solicitacoes = this.solicitacoesSignal();
    const alvo = solicitacoes.find((entrada) => entrada.id === id);
    if (!alvo) {
      return false;
    }

    this.aplicar(alvo);
    this.notificacaoService.atualizarStatus(alvo.notificacaoId, StatusNotificacao.APROVADA);
    this.persistir(solicitacoes.filter((entrada) => entrada.id !== id));
    return true;
  }

  rejeitar(id: number): void {
    const alvo = this.solicitacoesSignal().find((entrada) => entrada.id === id);
    if (alvo) {
      this.notificacaoService.atualizarStatus(alvo.notificacaoId, StatusNotificacao.REJEITADA);
    }

    this.persistir(this.solicitacoesSignal().filter((entrada) => entrada.id !== id));
  }

  private aplicar(alvo: ArraySolicitacoesHabilidadeModel): void {
    const { idPessoa, tipoSolicitacao, solicitacao } = alvo;

    if (tipoSolicitacao === TipoSolicitacaoHabilidade.ADICIONAR) {
      this.habilidadeService.criar(idPessoa, {
        habilidade: solicitacao.habilidade,
        tipo: solicitacao.tipo,
        icone: '',
      });
      return;
    }

    const indiceHabilidade = this.habilidadeService
      .listarPorId(idPessoa)
      .findIndex(
        (entrada) =>
          entrada.habilidade.habilidade === solicitacao.habilidade &&
          entrada.habilidade.tipo === solicitacao.tipo,
      );

    if (indiceHabilidade !== -1) {
      this.habilidadeService.remover(idPessoa, indiceHabilidade);
    }
  }

  private persistir(solicitacoes: ArraySolicitacoesHabilidadeModel[]): void {
    this.store.gravar(CHAVE_SOLICITACOES, solicitacoes);
    this.solicitacoesSignal.set(solicitacoes);
  }
}
