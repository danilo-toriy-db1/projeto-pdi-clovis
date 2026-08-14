import { Component, inject, output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../../shared/services/theme.service/theme.service';

@Component({
  selector: 'app-pagina-inicial-admin',
  imports: [NgOptimizedImage],
  templateUrl: './pagina-inicial-admin.html',
  styleUrl: './pagina-inicial-admin.scss',
})
export class PaginaInicialAdmin {
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  readonly irParaEditarDados = output<void>();

  protected alternarTema(): void {
    this.themeService.alternarTema();
  }

  protected irParaLandingPage(): void {
    this.router.navigateByUrl('/landing-page');
  }

  protected aoClicarEditarDados(): void {
    this.irParaEditarDados.emit();
  }
}
