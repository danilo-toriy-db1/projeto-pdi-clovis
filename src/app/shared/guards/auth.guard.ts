import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.temPermissaoPainelAdmin(authService.role())) {
    return true;
  }

  return router.createUrlTree(['/login'], { queryParams: { acessoNegado: 'true' } });
};
