import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { Header, PaginaHeader } from '../../../shared/components/header/header';
import { ArrayAboutModel } from '../../../shared/models/interfaces/about.model';
import { PessoaService } from '../../../shared/services/pessoa.service/pessoa.service';
import {
  LandingPageNaoEncontrada,
  MENSAGEM_LANDING_PAGE_NAO_ENCONTRADA,
} from '../../components/landing-page-nao-encontrada/landing-page-nao-encontrada';

const PAGINAS_LANDING_PAGE: PaginaHeader[] = [
  { rotulo: 'Página Inicial', rota: '.' },
  { rotulo: 'Sobre Mim', rota: 'sobre-mim' },
  { rotulo: 'Habilidades', rota: 'habilidades' },
  { rotulo: 'Contato e Sobre', rota: 'contato-e-sobre' },
];

@Component({
  selector: 'app-landing-page-id',
  imports: [Header, RouterOutlet, LandingPageNaoEncontrada],
  templateUrl: './landing-page-id.html',
  styleUrl: './landing-page-id.scss',
})
export class LandingPageId {
  private readonly route = inject(ActivatedRoute);
  private readonly pessoaService = inject(PessoaService);

  protected readonly paginasLandingPage = PAGINAS_LANDING_PAGE;
  protected readonly mensagemNaoEncontrada = MENSAGEM_LANDING_PAGE_NAO_ENCONTRADA;
  protected readonly entrada: ArrayAboutModel | undefined = this.resolverEntrada();

  private resolverEntrada(): ArrayAboutModel | undefined {
    const idParam = this.route.snapshot.paramMap.get('id') ?? '';
    return /^\d+$/.test(idParam) ? this.pessoaService.buscarPorId(Number(idParam)) : undefined;
  }
}
