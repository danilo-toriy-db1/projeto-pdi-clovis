import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LocalStorageArrayStore {
  ler<T>(chave: string): T[] {
    const itensSalvos = localStorage.getItem(chave);
    return itensSalvos ? JSON.parse(itensSalvos) : [];
  }

  gravar<T>(chave: string, itens: T[]): void {
    localStorage.setItem(chave, JSON.stringify(itens));
  }
}
