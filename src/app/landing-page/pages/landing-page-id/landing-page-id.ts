import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Footer } from '../../../shared/components/footer/footer';
import { Header, PaginaHeader } from '../../../shared/components/header/header';
import { ArrayAboutModel } from '../../../shared/models/interfaces/about.model';
import { PessoaService } from '../../../shared/services/pessoa.service/pessoa.service';
import {
  LandingPageNaoEncontrada,
  MENSAGEM_LANDING_PAGE_NAO_ENCONTRADA,
} from '../../components/landing-page-nao-encontrada/landing-page-nao-encontrada';
import { ContatoESobre } from '../contato-e-sobre/contato-e-sobre';
import { HabilidadesLanding } from '../habilidades-landing/habilidades-landing';
import { PaginaInicialLanding } from '../pagina-inicial-landing/pagina-inicial-landing';
import { SobreMim } from '../sobre-mim/sobre-mim';

type VistaLandingPage = 'inicio' | 'sobre-mim' | 'habilidades' | 'contato-e-sobre';

const VISTA_PADRAO: VistaLandingPage = 'inicio';

const PAGINAS_LANDING_PAGE: PaginaHeader[] = [
  { id: VISTA_PADRAO, rotulo: 'Página Inicial' },
  { id: 'sobre-mim', rotulo: 'Sobre Mim' },
  { id: 'habilidades', rotulo: 'Habilidades' },
  { id: 'contato-e-sobre', rotulo: 'Contato e Sobre' },
];

@Component({
  selector: 'app-landing-page-id',
  imports: [
    Header,
    Footer,
    LandingPageNaoEncontrada,
    PaginaInicialLanding,
    SobreMim,
    HabilidadesLanding,
    ContatoESobre,
  ],
  templateUrl: './landing-page-id.html',
  styleUrl: './landing-page-id.scss',
})
export class LandingPageId {
  private readonly route = inject(ActivatedRoute);
  private readonly pessoaService = inject(PessoaService);

  protected readonly paginasLandingPage = PAGINAS_LANDING_PAGE;
  protected readonly mensagemNaoEncontrada = MENSAGEM_LANDING_PAGE_NAO_ENCONTRADA;
  protected readonly entrada: ArrayAboutModel | undefined = this.resolverEntrada();
  protected readonly vistaAtual = signal<VistaLandingPage>(VISTA_PADRAO);

  protected selecionarVista(id: string): void {
    this.vistaAtual.set(this.paraVistaValida(id));
  }

  private resolverEntrada(): ArrayAboutModel | undefined {
    const idParam = this.route.snapshot.paramMap.get('id') ?? '';
    return /^\d+$/.test(idParam) ? this.pessoaService.buscarPorId(Number(idParam)) : undefined;
  }

  private paraVistaValida(id: string): VistaLandingPage {
    return PAGINAS_LANDING_PAGE.some((pagina) => pagina.id === id)
      ? (id as VistaLandingPage)
      : VISTA_PADRAO;
  }
}
