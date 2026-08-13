import { Component, input, output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  imports: [NgOptimizedImage],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.scss',
})
export class ConfirmModal {
  private readonly elementoQueAbriu = document.activeElement as HTMLElement | null;

  readonly mensagem = input.required<string>();
  readonly confirmar = output<void>();
  readonly cancelar = output<void>();

  protected aoConfirmar(): void {
    this.confirmar.emit();
  }

  protected aoCancelar(): void {
    this.elementoQueAbriu?.focus();
    this.cancelar.emit();
  }
}
