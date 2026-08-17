import { Injectable, inject } from '@angular/core';
import { CategoriaNotificacao } from '../../models/enums/categoria-notificacao.enum';
import { StatusNotificacao } from '../../models/enums/status-notificacao.enum';
import { TipoHabilidade } from '../../models/enums/tipo-habilidade.enum';
import { AboutModel } from '../../models/interfaces/about.model';
import { HabilitiesModel } from '../../models/interfaces/habilities.model';
import { ArrayNotificacaoModel } from '../../models/interfaces/notificacao.interface';
import { HabilidadeService } from '../habilidade.service/habilidade.service';
import { NotificacaoService } from '../notificacao.service/notificacao.service';
import { PessoaService } from '../pessoa.service/pessoa.service';

const USUARIO_SEED = 'admin';

const TEXTO_LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Deserunt, doloribus tempore ' +
  'nesciunt impedit corrupti, ab hic culpa fugiat iusto aperiam nulla maiores molestiae sint ' +
  'esse sunt pariatur. Atque, ipsam fuga?';

const DADOS_SEED: AboutModel = {
  nome: 'Danilo',
  idade: 20,
  carreira: 'Estudante',
  profissao: 'Estagiário',
  empresa: 'DB1 Group',
  imagem: '',
  descricao: {
    biografia: `biografia curta para servir de exemplo. ${TEXTO_LOREM}`,
    hobbies: `hobbies exemplo ${TEXTO_LOREM}`,
    desgostos: `desgostos exemplo ${TEXTO_LOREM}`,
    objetivos: `objetivos de exemplo ${TEXTO_LOREM}`,
  },
};

const HABILIDADES_SEED: HabilitiesModel[] = [
  { habilidade: 'Comunicação', tipo: TipoHabilidade.SOFT, icone: '' },
  { habilidade: 'Trabalho em Equipe', tipo: TipoHabilidade.SOFT, icone: '' },
  { habilidade: 'Angular', tipo: TipoHabilidade.HARD, icone: '' },
  { habilidade: 'TypeScript', tipo: TipoHabilidade.HARD, icone: '' },
];

const NOTIFICACOES_SEED: Array<Omit<ArrayNotificacaoModel, 'id'>> = [
  {
    categoria: CategoriaNotificacao.LOG,
    status: null,
    usuarioOrigem: 'convidado1',
    usuarioDestino: null,
    vista: true,
    notificacao: {
      titulo: 'Novo usuário cadastrado',
      descricao: 'convidado1 foi cadastrado com role user.',
    },
  },
  {
    categoria: CategoriaNotificacao.LOG,
    status: null,
    usuarioOrigem: 'novoAdmin1',
    usuarioDestino: null,
    vista: true,
    notificacao: {
      titulo: 'Nova Landing Page criada',
      descricao: 'novoAdmin1 agora é admin e passou a ter sua própria Landing Page.',
    },
  },
  {
    categoria: CategoriaNotificacao.SISTEMA,
    status: StatusNotificacao.APROVADA,
    usuarioOrigem: 'user',
    usuarioDestino: 'admin',
    vista: true,
    notificacao: {
      titulo: 'Sugestão de habilidade: Angular',
      descricao: 'user solicitou adicionar a habilidade "Angular" (hard-skill) para admin.',
    },
  },
  {
    categoria: CategoriaNotificacao.SISTEMA,
    status: StatusNotificacao.REJEITADA,
    usuarioOrigem: 'user',
    usuarioDestino: 'admin',
    vista: true,
    notificacao: {
      titulo: 'Sugestão de habilidade: Excel',
      descricao: 'user solicitou adicionar a habilidade "Excel" (hard-skill) para admin.',
    },
  },
  {
    categoria: CategoriaNotificacao.SISTEMA,
    status: StatusNotificacao.APROVADA,
    usuarioOrigem: 'convidado2',
    usuarioDestino: 'admin',
    vista: false,
    notificacao: {
      titulo: 'Sugestão de habilidade: Comunicação',
      descricao: 'convidado2 solicitou adicionar a habilidade "Comunicação" (soft-skill) para admin.',
    },
  },
  {
    categoria: CategoriaNotificacao.SISTEMA,
    status: StatusNotificacao.PENDENTE,
    usuarioOrigem: 'convidado2',
    usuarioDestino: 'admin',
    vista: false,
    notificacao: {
      titulo: 'Sugestão de habilidade: Figma',
      descricao: 'convidado2 solicitou adicionar a habilidade "Figma" (hard-skill) para admin.',
    },
  },
];

@Injectable({ providedIn: 'root' })
export class MockSeedService {
  private readonly pessoaService = inject(PessoaService);
  private readonly habilidadeService = inject(HabilidadeService);
  private readonly notificacaoService = inject(NotificacaoService);

  semearDadosDeExemplo(): void {
    this.semearPessoaEHabilidades();
    this.semearNotificacoes();
  }

  private semearPessoaEHabilidades(): void {
    if (this.pessoaService.listarTodas().length > 0) {
      return;
    }

    const entrada = this.pessoaService.resolverEntradaAdmin(USUARIO_SEED);
    this.pessoaService.salvar(entrada.id, DADOS_SEED);
    HABILIDADES_SEED.forEach((habilidade) => this.habilidadeService.criar(entrada.id, habilidade));
  }

  private semearNotificacoes(): void {
    if (this.notificacaoService.listarTodas().length > 0) {
      return;
    }

    NOTIFICACOES_SEED.forEach((notificacao) => this.notificacaoService.criar(notificacao));
  }
}
