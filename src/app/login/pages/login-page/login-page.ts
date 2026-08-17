import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Footer } from '../../../shared/components/footer/footer';
import { Header } from '../../../shared/components/header/header';
import { IntentLogin } from '../../../shared/models/enums/intent-login.enum';
import { SeoService } from '../../../shared/services/seo.service/seo.service';
import { LoginModal } from '../../components/login-modal/login-modal';

@Component({
  selector: 'app-login-page',
  imports: [Header, Footer, LoginModal],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  private readonly router = inject(Router);
  private readonly seoService = inject(SeoService);

  protected readonly IntentLogin = IntentLogin;
  protected readonly bolhas = Array.from({ length: 8 }, (_valor, indice) => indice);
  protected readonly intentAberto = signal<IntentLogin | null>(null);
  protected readonly acessoNegadoInicial = signal(false);

  constructor() {
    this.seoService.atualizar({
      titulo: 'Login',
      descricao: 'Acesse sua conta ou entre no painel administrativo da sua landing page.',
      semIndexacao: true,
    });

    const estado = history.state as { acessoNegado?: boolean } | undefined;
    if (estado?.acessoNegado) {
      this.acessoNegadoInicial.set(true);
      this.intentAberto.set(IntentLogin.PAINEL_ADMIN);
    }
  }

  protected abrirModal(intent: IntentLogin): void {
    this.intentAberto.set(intent);
  }

  protected fecharModal(): void {
    this.intentAberto.set(null);
  }

  protected irParaLandingPage(): void {
    this.router.navigateByUrl('/landing-page');
  }
}
