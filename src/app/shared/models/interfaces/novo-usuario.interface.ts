import { Role } from '../enums/role.enum';

export interface NovoUsuario {
  usuario: string;
  senha: string;
  role: Role;
}
