import { Routes } from '@angular/router';
import { escopoAdminGuard } from './guards/escopo-admin.guard';
import { PainelAdmin } from './pages/painel-admin/painel-admin';

export const ADMIN_ROUTES: Routes = [
  { path: 'control', component: PainelAdmin, canActivate: [escopoAdminGuard] },
  { path: ':id', component: PainelAdmin, canActivate: [escopoAdminGuard] },
];
