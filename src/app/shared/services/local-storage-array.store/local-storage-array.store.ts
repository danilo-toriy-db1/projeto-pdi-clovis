import { Injectable } from '@angular/core';

export interface ComId {
  id: number;
}

@Injectable({ providedIn: 'root' })
export class LocalStorageArrayStore {
  ler<T>(chave: string): T[] {
    const itensSalvos = localStorage.getItem(chave);
    return itensSalvos ? JSON.parse(itensSalvos) : [];
  }

  gravar<T>(chave: string, itens: T[]): void {
    localStorage.setItem(chave, JSON.stringify(itens));
  }

  proximoId<T extends ComId>(itens: readonly T[]): number {
    return itens.reduce((maior, item) => Math.max(maior, item.id + 1), 0);
  }
}
