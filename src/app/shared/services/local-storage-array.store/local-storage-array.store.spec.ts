import { TestBed } from '@angular/core/testing';
import { LocalStorageArrayStore } from './local-storage-array.store';

interface ItemDeTeste {
  id: number;
  nome: string;
}

describe('LocalStorageArrayStore', () => {
  let store: LocalStorageArrayStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    store = TestBed.inject(LocalStorageArrayStore);
  });

  it('deve retornar um array vazio quando a chave ainda não existe', () => {
    expect(store.ler<ItemDeTeste>('chave-inexistente')).toEqual([]);
  });

  it('deve gravar e reler o mesmo array sob a chave informada', () => {
    const itens: ItemDeTeste[] = [
      { id: 1, nome: 'um' },
      { id: 2, nome: 'dois' },
    ];

    store.gravar('minha-chave', itens);

    expect(store.ler<ItemDeTeste>('minha-chave')).toEqual(itens);
    expect(JSON.parse(localStorage.getItem('minha-chave') ?? '[]')).toEqual(itens);
  });

  it('deve sobrescrever o array gravado anteriormente sob a mesma chave', () => {
    store.gravar('minha-chave', [{ id: 1, nome: 'um' }]);
    store.gravar('minha-chave', [{ id: 2, nome: 'dois' }]);

    expect(store.ler<ItemDeTeste>('minha-chave')).toEqual([{ id: 2, nome: 'dois' }]);
  });

  it('deve manter chaves diferentes isoladas entre si', () => {
    store.gravar('chave-a', [{ id: 1, nome: 'a' }]);
    store.gravar('chave-b', [{ id: 2, nome: 'b' }]);

    expect(store.ler<ItemDeTeste>('chave-a')).toEqual([{ id: 1, nome: 'a' }]);
    expect(store.ler<ItemDeTeste>('chave-b')).toEqual([{ id: 2, nome: 'b' }]);
  });

  describe('proximoId', () => {
    it('deve devolver 0 quando a lista está vazia', () => {
      expect(store.proximoId<ItemDeTeste>([])).toBe(0);
    });

    it('deve devolver o maior id existente mais 1', () => {
      const itens: ItemDeTeste[] = [
        { id: 3, nome: 'a' },
        { id: 7, nome: 'b' },
        { id: 1, nome: 'c' },
      ];

      expect(store.proximoId(itens)).toBe(8);
    });
  });
});
