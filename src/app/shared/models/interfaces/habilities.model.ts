import { TipoHabilidade } from '../enums/tipo-habilidade.enum';

export interface HabilitiesModel {
  habilidade: string;
  tipo: TipoHabilidade;
  icone: string;
}

export interface ArrayHabilitiesModel {
  id: number;
  habilidade: HabilitiesModel;
}
