import { Role } from '../enums/role.enum';

export interface Sessao {
  usuario: string;
  role: Role;
}
