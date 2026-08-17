import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-alert-modal',
  templateUrl: './alert-modal.html',
  styleUrl: './alert-modal.scss',
})
export class AlertModal {
  private readonly elementoQueAbriu = document.activeElement as HTMLElement | null;

  readonly titulo = input.required<string>();
  readonly mensagem = input.required<string>();
  readonly rotuloAcao = input('Entendi');
  readonly fechar = output<void>();

  protected aoFechar(): void {
    this.elementoQueAbriu?.focus();
    this.fechar.emit();
  }
}
