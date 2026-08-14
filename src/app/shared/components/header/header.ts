import { Component, ElementRef, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { AuthService } from '../../services/auth.service/auth.service';
import { ThemeService } from '../../services/theme.service/theme.service';

export interface PaginaHeader {
  id: string;
  rotulo: string;
}

@Component({
  selector: 'app-header',
  imports: [NgOptimizedImage, NgTemplateOutlet],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  host: {
    '(document:keydown.escape)': 'fecharSidebar()',
  },
})
export class Header {
  private readonly themeService = inject(ThemeService);
  private readonly authService = inject(AuthService);
  private readonly hamburguerBtn = viewChild<ElementRef<HTMLButtonElement>>('hamburguerBtn');

  readonly reduzido = input(false);
  readonly paginas = input<PaginaHeader[]>([]);
  readonly paginaAtiva = input<string>('');
  readonly paginaSelecionada = output<string>();

  protected readonly sidebarAberta = signal(false);
  protected readonly temaEscuro = this.themeService.temaEscuro;
  protected readonly rotuloAlternanciaTema = this.themeService.rotuloAlternancia;
  protected readonly estaAutenticado = this.authService.estaAutenticado;

  constructor() {
    effect(() => {
      document.body.style.overflow = this.sidebarAberta() ? 'hidden' : '';
    });
  }

  protected alternarTema(): void {
    this.themeService.alternarTema();
  }

  protected sair(): void {
    this.authService.logout();
  }

  protected alternarSidebar(): void {
    this.sidebarAberta.update((aberta) => !aberta);
  }

  protected fecharSidebar(): void {
    if (!this.sidebarAberta()) {
      return;
    }

    this.sidebarAberta.set(false);
    this.hamburguerBtn()?.nativeElement.focus();
  }

  protected selecionarPagina(id: string): void {
    this.paginaSelecionada.emit(id);
  }
}
