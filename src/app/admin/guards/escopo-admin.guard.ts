import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from '../../shared/models/enums/role.enum';
import { AuthService } from '../../shared/services/auth.service/auth.service';

export const escopoAdminGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const sessao = authService.sessao();
  const idDaRota = route.paramMap.get('id');

  if (sessao?.role === Role.ADMIN && sessao.usuario !== idDaRota) {
    return router.createUrlTree(['/admin', sessao.usuario]);
  }

  return true;
};
