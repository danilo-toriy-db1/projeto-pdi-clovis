import { Component, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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
  private readonly activatedRoute = inject(ActivatedRoute);

  protected alternarTema(): void {
    this.themeService.alternarTema();
  }

  protected irParaLandingPage(): void {
    this.router.navigateByUrl('/landing-page');
  }

  protected irParaEditarDados(): void {
    this.router.navigate(['editar-dados'], { relativeTo: this.activatedRoute });
  }
}
