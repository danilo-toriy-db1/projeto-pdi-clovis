import { Component, computed, inject } from '@angular/core';
import { CategoriaNotificacao } from '../../../shared/models/enums/categoria-notificacao.enum';
import { StatusNotificacao } from '../../../shared/models/enums/status-notificacao.enum';
import { ArrayNotificacaoModel } from '../../../shared/models/interfaces/notificacao.interface';
import { NotificacaoService } from '../../../shared/services/notificacao.service/notificacao.service';

const ROTULOS_STATUS: Record<StatusNotificacao, string> = {
  [StatusNotificacao.PENDENTE]: 'Pendente',
  [StatusNotificacao.APROVADA]: 'Aprovada',
  [StatusNotificacao.REJEITADA]: 'Rejeitada',
};

@Component({
  selector: 'app-notificacoes-admin',
  templateUrl: './notificacoes-admin.html',
  styleUrl: './notificacoes-admin.scss',
})
export class NotificacoesAdmin {
  private readonly notificacaoService = inject(NotificacaoService);
  private readonly idsRecemChegados: ReadonlySet<number>;

  protected readonly rotulosStatus = ROTULOS_STATUS;

  protected readonly notificacoesSistema = computed<ArrayNotificacaoModel[]>(() =>
    this.notificacaoService.listarPorCategoria(CategoriaNotificacao.SISTEMA),
  );

  protected readonly notificacoesLog = computed<ArrayNotificacaoModel[]>(() =>
    this.notificacaoService.listarPorCategoria(CategoriaNotificacao.LOG),
  );

  constructor() {
    this.idsRecemChegados = new Set(
      this.notificacaoService
        .listarTodas()
        .filter((item) => !item.vista)
        .map((item) => item.id),
    );
    this.notificacaoService.marcarTodasComoVistas();
  }

  protected ehRecente(item: ArrayNotificacaoModel): boolean {
    return this.idsRecemChegados.has(item.id);
  }
}
