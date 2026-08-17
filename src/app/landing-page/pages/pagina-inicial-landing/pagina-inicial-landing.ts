import { Component, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Router } from '@angular/router';
import { Role } from '../../../shared/models/enums/role.enum';
import { AuthService } from '../../../shared/services/auth.service/auth.service';
import { ThemeService } from '../../../shared/services/theme.service/theme.service';

const URL_REPOSITORIO_GITHUB = 'https://github.com/';

@Component({
  selector: 'app-pagina-inicial-landing',
  imports: [NgOptimizedImage],
  templateUrl: './pagina-inicial-landing.html',
  styleUrl: './pagina-inicial-landing.scss',
})
export class PaginaInicialLanding {
  private readonly authService = inject(AuthService);
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  protected readonly urlRepositorioGithub = URL_REPOSITORIO_GITHUB;

  protected async irParaEditarDados(): Promise<void> {
    const sessao = this.authService.sessao();

    if (sessao?.role === Role.USER) {
      await this.authService.promoverParaAdmin(sessao.usuario);
      this.router.navigateByUrl(`/admin/${sessao.usuario}`, {
        state: { vistaInicial: 'editar-dados' },
      });
      return;
    }

    if (!this.authService.temPermissaoPainelAdmin(sessao?.role ?? null)) {
      this.router.navigateByUrl('/admin');
      return;
    }

    this.router.navigateByUrl(`/admin/${this.authService.resolverSegmentoAdmin(sessao!)}`, {
      state: { vistaInicial: 'editar-dados' },
    });
  }

  protected alternarTema(): void {
    this.themeService.alternarTema();
  }
}
