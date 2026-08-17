import { Injectable, inject } from '@angular/core';
import { AboutModel, ArrayAboutModel } from '../../models/interfaces/about.model';
import { HabilidadeService } from '../habilidade.service/habilidade.service';
import { LocalStorageArrayStore } from '../local-storage-array.store/local-storage-array.store';

const CHAVE_PESSOAS = 'admin.pessoas';
const CHAVE_VINCULOS = 'admin.vinculo-usuarios';
const IMAGEM_PADRAO = '/logo.svg';

const DADOS_VAZIOS: AboutModel = {
  nome: '',
  idade: 0,
  carreira: '',
  profissao: '',
  empresa: '',
  imagem: IMAGEM_PADRAO,
  descricao: { biografia: '', hobbies: '', desgostos: '', objetivos: '' },
};

@Injectable({ providedIn: 'root' })
export class PessoaService {
  private readonly store = inject(LocalStorageArrayStore);
  private readonly habilidadeService = inject(HabilidadeService);

  resolverEntradaAdmin(usuario: string): ArrayAboutModel {
    const vinculos = this.lerVinculos();
    const idVinculado = vinculos[usuario];
    const entradaExistente = idVinculado !== undefined ? this.buscarPorId(idVinculado) : undefined;

    if (entradaExistente) {
      return entradaExistente;
    }

    const novaEntrada = this.criarEntrada(DADOS_VAZIOS);
    vinculos[usuario] = novaEntrada.id;
    this.gravarVinculos(vinculos);
    return novaEntrada;
  }

  listarTodas(): ArrayAboutModel[] {
    return this.store.ler<ArrayAboutModel>(CHAVE_PESSOAS);
  }

  resolverUsuarioAdmin(id: number): string | null {
    const vinculos = this.lerVinculos();
    const usuario = Object.entries(vinculos).find(([, idVinculado]) => idVinculado === id);
    return usuario ? usuario[0] : null;
  }

  buscarPorId(id: number): ArrayAboutModel | undefined {
    return this.listarTodas().find((entrada) => entrada.id === id);
  }

  salvar(id: number, dados: AboutModel): void {
    const entradas = this.listarTodas();
    const indice = entradas.findIndex((entrada) => entrada.id === id);
    if (indice === -1) {
      return;
    }

    entradas[indice] = { id, dados: this.comImagemResolvida(dados) };
    this.store.gravar(CHAVE_PESSOAS, entradas);
  }

  criarNova(dados: AboutModel): ArrayAboutModel {
    return this.criarEntrada(dados);
  }

  remover(id: number): void {
    const entradas = this.listarTodas().filter((entrada) => entrada.id !== id);
    this.store.gravar(CHAVE_PESSOAS, entradas);
    this.habilidadeService.removerPorId(id);
    this.removerVinculosPorId(id);
  }

  private criarEntrada(dados: AboutModel): ArrayAboutModel {
    const entradas = this.listarTodas();
    const novaEntrada: ArrayAboutModel = {
      id: this.store.proximoId(entradas),
      dados: this.comImagemResolvida(dados),
    };
    entradas.push(novaEntrada);
    this.store.gravar(CHAVE_PESSOAS, entradas);
    return novaEntrada;
  }

  private comImagemResolvida(dados: AboutModel): AboutModel {
    return { ...dados, imagem: dados.imagem || IMAGEM_PADRAO };
  }

  private removerVinculosPorId(id: number): void {
    const vinculos = this.lerVinculos();
    const vinculosRestantes = Object.fromEntries(
      Object.entries(vinculos).filter(([, idVinculado]) => idVinculado !== id),
    );
    this.gravarVinculos(vinculosRestantes);
  }

  private lerVinculos(): Record<string, number> {
    const vinculosSalvos = localStorage.getItem(CHAVE_VINCULOS);
    return vinculosSalvos ? JSON.parse(vinculosSalvos) : {};
  }

  private gravarVinculos(vinculos: Record<string, number>): void {
    localStorage.setItem(CHAVE_VINCULOS, JSON.stringify(vinculos));
  }
}
