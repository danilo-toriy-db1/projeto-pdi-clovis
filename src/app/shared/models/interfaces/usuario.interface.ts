import { Role } from '../enums/role.enum';

export interface Usuario {
  usuario: string;
  senha: string;
  role: Role;
}
