import { CategoriaNotificacao } from '../enums/categoria-notificacao.enum';
import { StatusNotificacao } from '../enums/status-notificacao.enum';

export interface Notificacao {
  titulo: string;
  descricao: string;
}

export interface ArrayNotificacaoModel {
  id: number;
  categoria: CategoriaNotificacao;
  status: StatusNotificacao | null;
  usuarioOrigem: string;
  usuarioDestino: string | null;
  vista: boolean;
  notificacao: Notificacao;
}
