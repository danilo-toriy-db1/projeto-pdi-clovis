import { Component, inject, input, output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { EstadoFeedback, FeedbackModal } from '../feedback-modal/feedback-modal';
import { ThemeService } from '../../services/theme.service/theme.service';

export interface EditModalFeedback {
  estado: EstadoFeedback;
  mensagem?: string;
}

@Component({
  selector: 'app-edit-modal',
  imports: [NgOptimizedImage, FeedbackModal],
  templateUrl: './edit-modal.html',
  styleUrl: './edit-modal.scss',
})
export class EditModal {
  private readonly themeService = inject(ThemeService);
  private readonly elementoQueAbriu = document.activeElement as HTMLElement | null;

  readonly titulo = input.required<string>();
  readonly feedback = input<EditModalFeedback | null>(null);
  readonly largo = input(false);
  readonly fechar = output<void>();

  protected readonly temaEscuro = this.themeService.temaEscuro;

  protected aoFechar(): void {
    this.elementoQueAbriu?.focus();
    this.fechar.emit();
  }
}
