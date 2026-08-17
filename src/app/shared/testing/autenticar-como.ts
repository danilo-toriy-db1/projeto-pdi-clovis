import { Role } from '../models/enums/role.enum';

export function autenticarComo(usuario: string, role: Role): void {
  localStorage.setItem('login.sessao', JSON.stringify({ usuario, role }));
}
