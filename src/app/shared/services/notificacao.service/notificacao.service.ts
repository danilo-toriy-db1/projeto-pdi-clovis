import { Injectable, inject, signal } from '@angular/core';
import { CategoriaNotificacao } from '../../models/enums/categoria-notificacao.enum';
import { StatusNotificacao } from '../../models/enums/status-notificacao.enum';
import { ArrayNotificacaoModel } from '../../models/interfaces/notificacao.interface';
import { LocalStorageArrayStore } from '../local-storage-array.store/local-storage-array.store';

const CHAVE_NOTIFICACOES = 'admin.notificacoes.v2';

@Injectable({ providedIn: 'root' })
export class NotificacaoService {
  private readonly store = inject(LocalStorageArrayStore);
  private readonly notificacoesSignal = signal<ArrayNotificacaoModel[]>(
    this.store.ler<ArrayNotificacaoModel>(CHAVE_NOTIFICACOES),
  );

  listarTodas(): ArrayNotificacaoModel[] {
    return this.notificacoesSignal();
  }

  listarPorCategoria(categoria: CategoriaNotificacao): ArrayNotificacaoModel[] {
    return this.notificacoesSignal().filter((item) => item.categoria === categoria);
  }

  contarNaoVistas(): number {
    return this.notificacoesSignal().filter((item) => !item.vista).length;
  }

  criar(dados: Omit<ArrayNotificacaoModel, 'id'>): ArrayNotificacaoModel {
    const notificacoes = this.notificacoesSignal();
    const nova: ArrayNotificacaoModel = { id: this.store.proximoId(notificacoes), ...dados };
    this.persistir([...notificacoes, nova]);
    return nova;
  }

  atualizarStatus(id: number, status: StatusNotificacao): void {
    this.persistir(
      this.notificacoesSignal().map((item) => (item.id === id ? { ...item, status } : item)),
    );
  }

  marcarTodasComoVistas(): void {
    this.persistir(this.notificacoesSignal().map((item) => ({ ...item, vista: true })));
  }

  private persistir(notificacoes: ArrayNotificacaoModel[]): void {
    this.store.gravar(CHAVE_NOTIFICACOES, notificacoes);
    this.notificacoesSignal.set(notificacoes);
  }
}
