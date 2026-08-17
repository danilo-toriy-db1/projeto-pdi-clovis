import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Footer } from '../../../shared/components/footer/footer';
import { Header, PaginaHeader } from '../../../shared/components/header/header';
import { Role } from '../../../shared/models/enums/role.enum';
import { ArrayAboutModel } from '../../../shared/models/interfaces/about.model';
import { AuthService } from '../../../shared/services/auth.service/auth.service';
import { NotificacaoService } from '../../../shared/services/notificacao.service/notificacao.service';
import { PessoaService } from '../../../shared/services/pessoa.service/pessoa.service';
import { SeoService } from '../../../shared/services/seo.service/seo.service';
import { SolicitacaoHabilidadeService } from '../../../shared/services/solicitacao-habilidade.service/solicitacao-habilidade.service';
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
  private readonly router = inject(Router);
  private readonly pessoaService = inject(PessoaService);
  private readonly authService = inject(AuthService);
  private readonly solicitacaoService = inject(SolicitacaoHabilidadeService);
  private readonly notificacaoService = inject(NotificacaoService);
  private readonly seoService = inject(SeoService);

  protected readonly paginasLandingPage = PAGINAS_LANDING_PAGE;
  protected readonly mensagemNaoEncontrada = MENSAGEM_LANDING_PAGE_NAO_ENCONTRADA;
  protected readonly entrada: ArrayAboutModel | undefined = this.resolverEntrada();
  protected readonly vistaAtual = signal<VistaLandingPage>(VISTA_PADRAO);

  protected readonly ehSuper = computed(() => this.authService.role() === Role.SUPER);

  protected readonly contadorNotificacoes = computed(() =>
    this.ehSuper()
      ? this.notificacaoService.contarNaoVistas()
      : this.solicitacaoService.listarPendentesParaSessao(this.authService.sessao()).length,
  );

  constructor() {
    const pessoa = this.entrada;
    this.seoService.atualizar(
      pessoa
        ? {
            titulo: pessoa.dados.nome || `Landing Page ${pessoa.id}`,
            descricao: this.montarDescricao(pessoa),
          }
        : {
            titulo: 'Página não encontrada',
            descricao: 'Esta landing page não existe ou foi removida.',
            semIndexacao: true,
          },
    );
  }

  protected selecionarVista(id: string): void {
    this.vistaAtual.set(this.paraVistaValida(id));
  }

  protected abrirNotificacoes(): void {
    const sessao = this.authService.sessao();
    if (!sessao) {
      return;
    }

    const destino = `/admin/${this.authService.resolverSegmentoAdmin(sessao)}`;
    const vistaInicial = this.ehSuper() ? 'notificacoes' : 'solicitacoes';
    this.router.navigateByUrl(destino, { state: { vistaInicial } });
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

  private montarDescricao(pessoa: ArrayAboutModel): string {
    const { profissao, empresa, descricao } = pessoa.dados;
    if (profissao && empresa) {
      return `${profissao} na ${empresa}. Conheça a landing page pessoal.`;
    }

    return descricao.biografia.slice(0, 160) || 'Landing page pessoal com Sobre Mim e Habilidades.';
  }
}
