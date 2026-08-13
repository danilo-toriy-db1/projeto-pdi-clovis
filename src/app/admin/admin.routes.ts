import { Routes } from '@angular/router';
import { escopoAdminGuard } from './guards/escopo-admin.guard';
import { EditarDados } from './pages/editar-dados/editar-dados';
import { EditarUsuarios } from './pages/editar-usuarios/editar-usuarios';
import { PaginaInicialAdmin } from './pages/pagina-inicial-admin/pagina-inicial-admin';
import { PainelAdmin } from './pages/painel-admin/painel-admin';

const PAGINAS_PAINEL: Routes = [
  { path: '', component: PaginaInicialAdmin },
  { path: 'editar-dados', component: EditarDados },
  { path: 'editar-usuarios', component: EditarUsuarios },
];

export const ADMIN_ROUTES: Routes = [
  {
    path: 'super',
    component: PainelAdmin,
    children: PAGINAS_PAINEL,
  },
  {
    path: ':id',
    component: PainelAdmin,
    canActivate: [escopoAdminGuard],
    children: PAGINAS_PAINEL,
  },
];
