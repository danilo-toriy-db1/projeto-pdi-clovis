import { Routes } from '@angular/router';
import { ContatoESobre } from './pages/contato-e-sobre/contato-e-sobre';
import { HabilidadesLanding } from './pages/habilidades-landing/habilidades-landing';
import { LandingPageControle } from './pages/landing-page-controle/landing-page-controle';
import { LandingPageId } from './pages/landing-page-id/landing-page-id';
import { PaginaInicialLanding } from './pages/pagina-inicial-landing/pagina-inicial-landing';
import { SobreMim } from './pages/sobre-mim/sobre-mim';
import { UrlInvalida } from './pages/url-invalida/url-invalida';

const PAGINAS_LANDING_PAGE: Routes = [
  { path: '', component: PaginaInicialLanding },
  { path: 'sobre-mim', component: SobreMim },
  { path: 'habilidades', component: HabilidadesLanding },
  { path: 'contato-e-sobre', component: ContatoESobre },
];

export const LANDING_PAGE_ROUTES: Routes = [
  { path: 'control', component: LandingPageControle },
  { path: ':id', component: LandingPageId, children: PAGINAS_LANDING_PAGE },
  { path: '', component: UrlInvalida },
];
