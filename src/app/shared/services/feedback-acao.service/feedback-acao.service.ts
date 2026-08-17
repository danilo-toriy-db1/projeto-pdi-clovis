import { Injectable, WritableSignal, inject } from '@angular/core';
import { EditModalFeedback } from '../../components/edit-modal/edit-modal';
import { AtrasoService } from '../atraso.service/atraso.service';

export interface ResultadoAcaoComFeedback {
  sucesso: boolean;
  mensagemErro?: string;
}

export interface OpcoesFeedbackAcao {
  delayCarregando: number;
  acao: () => void | ResultadoAcaoComFeedback | Promise<void | ResultadoAcaoComFeedback>;
  delaySucesso: number;
  mensagemSucesso?: string;
  aoSucesso?: () => void;
  aoErro?: (mensagem: string) => void;
}

@Injectable({ providedIn: 'root' })
export class FeedbackAcaoService {
  private readonly atrasoService = inject(AtrasoService);

  async executar(
    feedback: WritableSignal<EditModalFeedback | null>,
    opcoes: OpcoesFeedbackAcao,
  ): Promise<boolean> {
    feedback.set({ estado: 'carregando', mensagem: '' });
    await this.atrasoService.aguardar(opcoes.delayCarregando);

    const resultado = await opcoes.acao();

    if (resultado && !resultado.sucesso) {
      feedback.set(null);
      opcoes.aoErro?.(resultado.mensagemErro ?? '');
      return false;
    }

    feedback.set({ estado: 'sucesso', mensagem: opcoes.mensagemSucesso ?? '' });
    setTimeout(() => {
      feedback.set(null);
      opcoes.aoSucesso?.();
    }, opcoes.delaySucesso);

    return true;
  }
}
