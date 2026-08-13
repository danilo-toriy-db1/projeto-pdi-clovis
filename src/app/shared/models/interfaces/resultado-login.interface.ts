import { ResultadoAutenticacao } from '../enums/resultado-autenticacao.enum';

export interface ResultadoLogin {
  resultado: ResultadoAutenticacao;
  destino?: string;
}
