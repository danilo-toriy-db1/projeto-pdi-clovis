import { Routes } from '@angular/router';
import { LandingPageControle } from './pages/landing-page-controle/landing-page-controle';
import { LandingPageId } from './pages/landing-page-id/landing-page-id';
import { UrlInvalida } from './pages/url-invalida/url-invalida';

export const LANDING_PAGE_ROUTES: Routes = [
  { path: 'control', component: LandingPageControle },
  { path: ':id', component: LandingPageId },
  { path: '', component: UrlInvalida },
];
