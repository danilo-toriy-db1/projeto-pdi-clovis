import { Component, computed, inject, output, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { Router } from '@angular/router';
import { EditModal } from '../../../shared/components/edit-modal/edit-modal';
import { Role } from '../../../shared/models/enums/role.enum';
import { AuthService } from '../../../shared/services/auth.service/auth.service';
import { ThemeService } from '../../../shared/services/theme.service/theme.service';
import { FormularioMensagemFeedback } from '../../components/formulario-mensagem-feedback/formulario-mensagem-feedback';

@Component({
  selector: 'app-pagina-inicial-admin',
  imports: [NgOptimizedImage, EditModal, FormularioMensagemFeedback],
  templateUrl: './pagina-inicial-admin.html',
  styleUrl: './pagina-inicial-admin.scss',
})
export class PaginaInicialAdmin {
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly irParaEditarDados = output<void>();
  readonly irParaEditarUsuarios = output<void>();

  protected readonly ehSuper = computed(() => this.authService.role() === Role.SUPER);
  protected readonly modalSugestaoAberto = signal(false);

  protected alternarTema(): void {
    this.themeService.alternarTema();
  }

  protected irParaLandingPage(): void {
    this.router.navigateByUrl('/landing-page');
  }

  protected aoClicarEditarDados(): void {
    this.irParaEditarDados.emit();
  }

  protected aoClicarGerenciarLandingPages(): void {
    this.irParaEditarDados.emit();
  }

  protected aoClicarGerenciarUsuarios(): void {
    this.irParaEditarUsuarios.emit();
  }

  protected abrirModalSugestao(): void {
    this.modalSugestaoAberto.set(true);
  }

  protected fecharModalSugestao(): void {
    this.modalSugestaoAberto.set(false);
  }

  protected enviarSugestao(mensagem: string): void {
    console.log('Sugestão enviada para o dev:', mensagem);
    this.modalSugestaoAberto.set(false);
  }
}
