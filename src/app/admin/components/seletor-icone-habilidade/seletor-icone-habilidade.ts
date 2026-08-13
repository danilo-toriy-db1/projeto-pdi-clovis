import { Component, inject, input, output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { HabilidadeService } from '../../../shared/services/habilidade.service/habilidade.service';

@Component({
  selector: 'app-seletor-icone-habilidade',
  imports: [NgOptimizedImage],
  templateUrl: './seletor-icone-habilidade.html',
  styleUrl: './seletor-icone-habilidade.scss',
})
export class SeletorIconeHabilidade {
  private readonly habilidadeService = inject(HabilidadeService);
  private readonly elementoQueAbriu = document.activeElement as HTMLElement | null;

  readonly iconeSelecionado = input<string>('');
  readonly selecionar = output<string>();
  readonly fechar = output<void>();

  protected readonly iconesDisponiveis = this.habilidadeService.listarIconesDisponiveis();

  protected aoSelecionar(icone: string): void {
    this.selecionar.emit(icone);
  }

  protected aoFechar(): void {
    this.elementoQueAbriu?.focus();
    this.fechar.emit();
  }
}
