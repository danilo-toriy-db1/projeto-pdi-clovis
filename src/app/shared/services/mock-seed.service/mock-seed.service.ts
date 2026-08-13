import { Injectable, inject } from '@angular/core';
import { TipoHabilidade } from '../../models/enums/tipo-habilidade.enum';
import { AboutModel } from '../../models/interfaces/about.model';
import { HabilitiesModel } from '../../models/interfaces/habilities.model';
import { HabilidadeService } from '../habilidade.service/habilidade.service';
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

@Injectable({ providedIn: 'root' })
export class MockSeedService {
  private readonly pessoaService = inject(PessoaService);
  private readonly habilidadeService = inject(HabilidadeService);

  semearDadosDeExemplo(): void {
    if (this.pessoaService.listarTodas().length > 0) {
      return;
    }

    const entrada = this.pessoaService.resolverEntradaAdmin(USUARIO_SEED);
    this.pessoaService.salvar(entrada.id, DADOS_SEED);
    HABILIDADES_SEED.forEach((habilidade) => this.habilidadeService.criar(entrada.id, habilidade));
  }
}
