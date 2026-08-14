import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Footer } from '../../../shared/components/footer/footer';
import { Header } from '../../../shared/components/header/header';
import { IntentLogin } from '../../../shared/models/enums/intent-login.enum';
import { LoginModal } from '../../components/login-modal/login-modal';

@Component({
  selector: 'app-login-page',
  imports: [Header, Footer, LoginModal],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  private readonly router = inject(Router);

  protected readonly IntentLogin = IntentLogin;
  protected readonly bolhas = Array.from({ length: 8 }, (_valor, indice) => indice);
  protected readonly intentAberto = signal<IntentLogin | null>(null);

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
