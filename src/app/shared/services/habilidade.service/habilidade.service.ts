import { Injectable, inject } from '@angular/core';
import { ArrayHabilitiesModel, HabilitiesModel } from '../../models/interfaces/habilities.model';
import { LocalStorageArrayStore } from '../local-storage-array.store/local-storage-array.store';

const CHAVE_HABILIDADES = 'admin.habilidades';
export const ICONE_PLACEHOLDER = 'placeholder.svg';

const ICONES_DISPONIVEIS: readonly string[] = [ICONE_PLACEHOLDER];

@Injectable({ providedIn: 'root' })
export class HabilidadeService {
  private readonly store = inject(LocalStorageArrayStore);

  listarPorId(id: number): ArrayHabilitiesModel[] {
    return this.listarTodas().filter((entrada) => entrada.id === id);
  }

  listarIconesDisponiveis(): string[] {
    return [...ICONES_DISPONIVEIS];
  }

  criar(id: number, habilidade: HabilitiesModel): void {
    const entradas = this.listarTodas();
    entradas.push({ id, habilidade: this.comIconeResolvido(habilidade) });
    this.store.gravar(CHAVE_HABILIDADES, entradas);
  }

  atualizar(id: number, indice: number, habilidade: HabilitiesModel): void {
    const entradas = this.listarTodas();
    const indiceGlobal = this.indiceGlobal(entradas, id, indice);
    if (indiceGlobal === -1) {
      return;
    }

    entradas[indiceGlobal] = { id, habilidade: this.comIconeResolvido(habilidade) };
    this.store.gravar(CHAVE_HABILIDADES, entradas);
  }

  remover(id: number, indice: number): void {
    const entradas = this.listarTodas();
    const indiceGlobal = this.indiceGlobal(entradas, id, indice);
    if (indiceGlobal === -1) {
      return;
    }

    entradas.splice(indiceGlobal, 1);
    this.store.gravar(CHAVE_HABILIDADES, entradas);
  }

  removerPorId(id: number): void {
    const entradas = this.listarTodas().filter((entrada) => entrada.id !== id);
    this.store.gravar(CHAVE_HABILIDADES, entradas);
  }

  private indiceGlobal(entradas: ArrayHabilitiesModel[], id: number, indice: number): number {
    let contador = -1;
    return entradas.findIndex((entrada) => {
      if (entrada.id !== id) {
        return false;
      }

      contador += 1;
      return contador === indice;
    });
  }

  private comIconeResolvido(habilidade: HabilitiesModel): HabilitiesModel {
    return { ...habilidade, icone: habilidade.icone || ICONE_PLACEHOLDER };
  }

  private listarTodas(): ArrayHabilitiesModel[] {
    return this.store.ler<ArrayHabilitiesModel>(CHAVE_HABILIDADES);
  }
}
