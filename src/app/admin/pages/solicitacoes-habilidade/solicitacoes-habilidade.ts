import { Component, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { EditModalFeedback } from '../../../shared/components/edit-modal/edit-modal';
import { FeedbackModal } from '../../../shared/components/feedback-modal/feedback-modal';
import { Role } from '../../../shared/models/enums/role.enum';
import { TipoSolicitacaoHabilidade } from '../../../shared/models/enums/tipo-solicitacao-habilidade.enum';
import { ArraySolicitacoesHabilidadeModel } from '../../../shared/models/interfaces/solicitacao-habilidade.interface';
import { AuthService } from '../../../shared/services/auth.service/auth.service';
import { FeedbackAcaoService } from '../../../shared/services/feedback-acao.service/feedback-acao.service';
import { SolicitacaoHabilidadeService } from '../../../shared/services/solicitacao-habilidade.service/solicitacao-habilidade.service';

@Component({
  selector: 'app-solicitacoes-habilidade',
  imports: [NgOptimizedImage, FeedbackModal],
  templateUrl: './solicitacoes-habilidade.html',
  styleUrl: './solicitacoes-habilidade.scss',
})
export class SolicitacoesHabilidade {
  private readonly authService = inject(AuthService);
  private readonly solicitacaoService = inject(SolicitacaoHabilidadeService);
  private readonly feedbackAcaoService = inject(FeedbackAcaoService);

  protected readonly TipoSolicitacaoHabilidade = TipoSolicitacaoHabilidade;
  protected readonly ehSuper = computed(() => this.authService.role() === Role.SUPER);
  protected readonly feedback = signal<EditModalFeedback | null>(null);

  protected readonly solicitacoes = computed<ArraySolicitacoesHabilidadeModel[]>(() =>
    this.solicitacaoService.listarPendentesParaSessao(this.authService.sessao()),
  );

  protected async aceitar(solicitacao: ArraySolicitacoesHabilidadeModel): Promise<void> {
    await this.feedbackAcaoService.executar(this.feedback, {
      delayCarregando: 500,
      acao: () => {
        this.solicitacaoService.aceitar(solicitacao.id);
      },
      mensagemSucesso: 'Solicitação aceita! Habilidade atualizada.',
      delaySucesso: 1000,
    });
  }

  protected async rejeitar(solicitacao: ArraySolicitacoesHabilidadeModel): Promise<void> {
    await this.feedbackAcaoService.executar(this.feedback, {
      delayCarregando: 500,
      acao: () => {
        this.solicitacaoService.rejeitar(solicitacao.id);
      },
      mensagemSucesso: 'Solicitação rejeitada.',
      delaySucesso: 1000,
    });
  }
}
