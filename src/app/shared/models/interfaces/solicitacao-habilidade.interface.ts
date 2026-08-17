import { TipoHabilidade } from '../enums/tipo-habilidade.enum';
import { TipoSolicitacaoHabilidade } from '../enums/tipo-solicitacao-habilidade.enum';

export interface SolicitacaoHabilidade {
  habilidade: string;
  tipo: TipoHabilidade;
  usuarioSolicitante: string;
}

export interface ArraySolicitacoesHabilidadeModel {
  id: number;
  notificacaoId: number;
  idPessoa: number;
  usuarioAdminAlvo: string | null;
  tipoSolicitacao: TipoSolicitacaoHabilidade;
  solicitacao: SolicitacaoHabilidade;
}
