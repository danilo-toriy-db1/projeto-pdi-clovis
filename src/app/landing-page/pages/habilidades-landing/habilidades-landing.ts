import { Component, computed, inject, input, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { AlertModal } from '../../../shared/components/alert-modal/alert-modal';
import { EditModal, EditModalFeedback } from '../../../shared/components/edit-modal/edit-modal';
import { TipoHabilidade } from '../../../shared/models/enums/tipo-habilidade.enum';
import { TipoSolicitacaoHabilidade } from '../../../shared/models/enums/tipo-solicitacao-habilidade.enum';
import { ArrayHabilitiesModel } from '../../../shared/models/interfaces/habilities.model';
import { AuthService } from '../../../shared/services/auth.service/auth.service';
import { FeedbackAcaoService } from '../../../shared/services/feedback-acao.service/feedback-acao.service';
import { HabilidadeService } from '../../../shared/services/habilidade.service/habilidade.service';
import { PessoaService } from '../../../shared/services/pessoa.service/pessoa.service';
import { SolicitacaoHabilidadeService } from '../../../shared/services/solicitacao-habilidade.service/solicitacao-habilidade.service';
import { ThemeService } from '../../../shared/services/theme.service/theme.service';
import {
  FormularioSolicitacaoHabilidade,
  SolicitacaoHabilidadeFormValue,
} from '../../components/formulario-solicitacao-habilidade/formulario-solicitacao-habilidade';

@Component({
  selector: 'app-habilidades-landing',
  imports: [NgOptimizedImage, EditModal, AlertModal, FormularioSolicitacaoHabilidade],
  templateUrl: './habilidades-landing.html',
  styleUrl: './habilidades-landing.scss',
})
export class HabilidadesLanding {
  private readonly habilidadeService = inject(HabilidadeService);
  private readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);
  private readonly pessoaService = inject(PessoaService);
  private readonly solicitacaoService = inject(SolicitacaoHabilidadeService);
  private readonly feedbackAcaoService = inject(FeedbackAcaoService);

  protected readonly tipoSoft = TipoHabilidade.SOFT;
  protected readonly TipoSolicitacaoHabilidade = TipoSolicitacaoHabilidade;
  protected readonly temaEscuro = this.themeService.temaEscuro;

  readonly id = input.required<number>();

  private readonly todasHabilidades = computed<ArrayHabilitiesModel[]>(() =>
    this.habilidadeService.listarPorId(this.id()),
  );

  protected readonly habilidadesTrilha = computed(() => this.todasHabilidades());
  protected readonly semHabilidades = computed(() => this.habilidadesTrilha().length === 0);

  protected readonly loginObrigatorioAberto = signal(false);
  protected readonly tipoSolicitacaoAberta = signal<TipoSolicitacaoHabilidade | null>(null);
  protected readonly feedbackSolicitacao = signal<EditModalFeedback | null>(null);

  protected abrirSolicitacao(tipo: TipoSolicitacaoHabilidade): void {
    if (!this.authService.estaAutenticado()) {
      this.loginObrigatorioAberto.set(true);
      return;
    }

    this.tipoSolicitacaoAberta.set(tipo);
  }

  protected fecharAvisoLogin(): void {
    this.loginObrigatorioAberto.set(false);
  }

  protected cancelarSolicitacao(): void {
    this.tipoSolicitacaoAberta.set(null);
  }

  protected async enviarSolicitacao(valor: SolicitacaoHabilidadeFormValue): Promise<void> {
    const tipoSolicitacao = this.tipoSolicitacaoAberta();
    const sessao = this.authService.sessao();
    if (!tipoSolicitacao || !sessao) {
      return;
    }

    await this.feedbackAcaoService.executar(this.feedbackSolicitacao, {
      delayCarregando: 500,
      acao: () => {
        this.solicitacaoService.solicitar({
          idPessoa: this.id(),
          usuarioAdminAlvo: this.pessoaService.resolverUsuarioAdmin(this.id()),
          tipoSolicitacao,
          solicitacao: {
            habilidade: valor.habilidade,
            tipo: valor.tipo,
            usuarioSolicitante: sessao.usuario,
          },
        });
      },
      mensagemSucesso: 'Solicitação enviada!',
      delaySucesso: 1000,
      aoSucesso: () => this.tipoSolicitacaoAberta.set(null),
    });
  }
}
