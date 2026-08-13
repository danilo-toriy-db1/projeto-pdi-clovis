import { Component, computed, input } from '@angular/core';

export type EstadoFeedback = 'carregando' | 'sucesso' | 'mensagem';

const MENSAGEM_PADRAO: Record<EstadoFeedback, string> = {
  carregando: 'Carregando…',
  sucesso: 'Sucesso!',
  mensagem: 'Atenção.',
};

@Component({
  selector: 'app-feedback-modal',
  templateUrl: './feedback-modal.html',
  styleUrl: './feedback-modal.scss',
})
export class FeedbackModal {
  readonly estado = input.required<EstadoFeedback>();
  readonly mensagem = input('');

  protected readonly textoExibido = computed(
    () => this.mensagem() || MENSAGEM_PADRAO[this.estado()],
  );
}
