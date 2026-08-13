import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'landing-page',
    loadChildren: () =>
      import('./landing-page/landing-page.routes').then((modulo) => modulo.LANDING_PAGE_ROUTES),
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.routes').then((modulo) => modulo.LOGIN_ROUTES),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () => import('./admin/admin.routes').then((modulo) => modulo.ADMIN_ROUTES),
  },
  { path: '**',
    redirectTo: 'login'
  }
];
