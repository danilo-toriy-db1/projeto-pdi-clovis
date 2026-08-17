import { Component, computed, inject, signal } from '@angular/core';
import { Footer } from '../../../shared/components/footer/footer';
import { Header, PaginaHeader } from '../../../shared/components/header/header';
import { Role } from '../../../shared/models/enums/role.enum';
import { AuthService } from '../../../shared/services/auth.service/auth.service';
import { NotificacaoService } from '../../../shared/services/notificacao.service/notificacao.service';
import { SeoService } from '../../../shared/services/seo.service/seo.service';
import { SolicitacaoHabilidadeService } from '../../../shared/services/solicitacao-habilidade.service/solicitacao-habilidade.service';
import { EditarDados } from '../editar-dados/editar-dados';
import { EditarUsuarios } from '../editar-usuarios/editar-usuarios';
import { NotificacoesAdmin } from '../notificacoes-admin/notificacoes-admin';
import { PaginaInicialAdmin } from '../pagina-inicial-admin/pagina-inicial-admin';
import { SolicitacoesHabilidade } from '../solicitacoes-habilidade/solicitacoes-habilidade';

type VistaAdmin = 'inicio' | 'editar-dados' | 'editar-usuarios' | 'solicitacoes' | 'notificacoes';

const VISTA_PADRAO: VistaAdmin = 'inicio';

const PAGINAS_BASE: PaginaHeader[] = [
  { id: VISTA_PADRAO, rotulo: 'Página Inicial' },
  { id: 'editar-dados', rotulo: 'Editar Dados' },
  { id: 'editar-usuarios', rotulo: 'Editar Usuários' },
];

const PAGINA_NOTIFICACOES: PaginaHeader = { id: 'notificacoes', rotulo: 'Notificações' };

const VISTAS_VALIDAS: VistaAdmin[] = [
  ...PAGINAS_BASE.map((pagina) => pagina.id as VistaAdmin),
  'solicitacoes',
  'notificacoes',
];

@Component({
  selector: 'app-painel-admin',
  imports: [
    Header,
    Footer,
    PaginaInicialAdmin,
    EditarDados,
    EditarUsuarios,
    SolicitacoesHabilidade,
    NotificacoesAdmin,
  ],
  templateUrl: './painel-admin.html',
  styleUrl: './painel-admin.scss',
})
export class PainelAdmin {
  private readonly authService = inject(AuthService);
  private readonly solicitacaoService = inject(SolicitacaoHabilidadeService);
  private readonly notificacaoService = inject(NotificacaoService);
  private readonly seoService = inject(SeoService);

  protected readonly ehSuper = computed(() => this.authService.role() === Role.SUPER);
  protected readonly paginasPainel = computed<PaginaHeader[]>(() =>
    this.ehSuper() ? [...PAGINAS_BASE, PAGINA_NOTIFICACOES] : PAGINAS_BASE,
  );
  protected readonly vistaAtual = signal<VistaAdmin>(this.resolverVistaInicial());

  constructor() {
    this.seoService.atualizar({
      titulo: 'Painel Administrativo',
      descricao: 'Área administrativa para editar dados, habilidades, usuários e solicitações.',
      semIndexacao: true,
    });
  }

  protected readonly contadorNotificacoes = computed(() =>
    this.ehSuper()
      ? this.notificacaoService.contarNaoVistas()
      : this.solicitacaoService.listarPendentesParaSessao(this.authService.sessao()).length,
  );

  protected selecionarVista(id: string): void {
    this.vistaAtual.set(this.paraVistaValida(id));
  }

  protected abrirNotificacoes(): void {
    this.selecionarVista(this.ehSuper() ? 'notificacoes' : 'solicitacoes');
  }

  private resolverVistaInicial(): VistaAdmin {
    const estado = history.state as { vistaInicial?: string } | undefined;
    return this.paraVistaValida(estado?.vistaInicial ?? VISTA_PADRAO);
  }

  private paraVistaValida(id: string): VistaAdmin {
    if (!VISTAS_VALIDAS.includes(id as VistaAdmin)) {
      return VISTA_PADRAO;
    }

    if (id === 'notificacoes' && !this.ehSuper()) {
      return VISTA_PADRAO;
    }

    return id as VistaAdmin;
  }
}
