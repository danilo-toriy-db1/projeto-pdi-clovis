import { Component, input } from '@angular/core';

export const MENSAGEM_LANDING_PAGE_NAO_ENCONTRADA =
  'Não encontramos essa Landing Page. Verifique o endereço e tente novamente.';

@Component({
  selector: 'app-landing-page-nao-encontrada',
  templateUrl: './landing-page-nao-encontrada.html',
  styleUrl: './landing-page-nao-encontrada.scss',
})
export class LandingPageNaoEncontrada {
  readonly mensagem = input.required<string>();
}
