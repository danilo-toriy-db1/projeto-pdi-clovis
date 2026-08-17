import { Component, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { EditModal, EditModalFeedback } from '../../../shared/components/edit-modal/edit-modal';
import { ConfirmModal } from '../../../shared/components/confirm-modal/confirm-modal';
import { Role } from '../../../shared/models/enums/role.enum';
import { NovoUsuario } from '../../../shared/models/interfaces/novo-usuario.interface';
import { Usuario } from '../../../shared/models/interfaces/usuario.interface';
import { AuthService } from '../../../shared/services/auth.service/auth.service';
import { FeedbackAcaoService } from '../../../shared/services/feedback-acao.service/feedback-acao.service';
import { ThemeService } from '../../../shared/services/theme.service/theme.service';
import { FormularioUsuario } from '../../components/formulario-usuario/formulario-usuario';

@Component({
  selector: 'app-editar-usuarios',
  imports: [NgOptimizedImage, ConfirmModal, EditModal, FormularioUsuario],
  templateUrl: './editar-usuarios.html',
  styleUrl: './editar-usuarios.scss',
})
export class EditarUsuarios {
  private readonly authService = inject(AuthService);
  private readonly themeService = inject(ThemeService);
  private readonly feedbackAcaoService = inject(FeedbackAcaoService);

  protected readonly sessao = this.authService.sessao;
  protected readonly temaEscuro = this.themeService.temaEscuro;
  protected readonly rolesDisponiveis = computed(() =>
    this.authService.rolesCriaveis(this.sessao()?.role ?? null),
  );

  protected readonly usuarios = signal<Usuario[]>([]);
  protected readonly usuarioParaRemover = signal<Usuario | null>(null);
  protected readonly usuarioEmEdicao = signal<Usuario | null>(null);
  protected readonly modalUsuarioAberto = signal(false);
  protected readonly feedbackUsuario = signal<EditModalFeedback | null>(null);
  protected readonly erroUsuario = signal<string | null>(null);

  protected readonly carregamentoInicial: Promise<void>;

  constructor() {
    this.carregamentoInicial = this.carregarUsuarios();
  }

  protected podeRemover(usuario: Usuario): boolean {
    return usuario.role !== Role.SUPER;
  }

  protected abrirCriacaoUsuario(): void {
    this.usuarioEmEdicao.set(null);
    this.erroUsuario.set(null);
    this.modalUsuarioAberto.set(true);
  }

  protected abrirEdicaoUsuario(usuario: Usuario): void {
    this.usuarioEmEdicao.set(usuario);
    this.erroUsuario.set(null);
    this.modalUsuarioAberto.set(true);
  }

  protected cancelarEdicaoUsuario(): void {
    this.usuarioEmEdicao.set(null);
    this.erroUsuario.set(null);
    this.modalUsuarioAberto.set(false);
  }

  protected async salvarUsuario(dados: NovoUsuario): Promise<void> {
    this.erroUsuario.set(null);
    const emEdicao = this.usuarioEmEdicao();
    const roleDeQuemEdita = this.sessao()?.role ?? null;

    await this.feedbackAcaoService.executar(this.feedbackUsuario, {
      delayCarregando: 500,
      acao: async () => {
        const sucesso = emEdicao
          ? await this.authService.atualizarUsuario(dados, roleDeQuemEdita)
          : await this.authService.criarUsuario(dados, roleDeQuemEdita);

        if (!sucesso) {
          return {
            sucesso: false,
            mensagemErro: emEdicao
              ? 'Não foi possível salvar as alterações desse usuário.'
              : 'Esse usuário já existe. Escolha outro identificador.',
          };
        }

        await this.carregarUsuarios();
        return { sucesso: true };
      },
      delaySucesso: 800,
      aoErro: (mensagem) => this.erroUsuario.set(mensagem),
      aoSucesso: () => {
        this.usuarioEmEdicao.set(null);
        this.modalUsuarioAberto.set(false);
      },
    });
  }

  protected pedirRemocaoUsuarioEmEdicao(): void {
    const emEdicao = this.usuarioEmEdicao();
    if (!emEdicao) {
      return;
    }

    this.pedirRemocao(emEdicao);
  }

  protected pedirRemocao(usuario: Usuario): void {
    this.usuarioParaRemover.set(usuario);
  }

  protected async confirmarRemocao(): Promise<void> {
    const usuario = this.usuarioParaRemover();
    if (!usuario) {
      return;
    }

    await this.authService.excluirUsuario(usuario.usuario);
    this.usuarioParaRemover.set(null);
    this.usuarioEmEdicao.set(null);
    this.modalUsuarioAberto.set(false);
    await this.carregarUsuarios();
  }

  protected cancelarRemocao(): void {
    this.usuarioParaRemover.set(null);
  }

  private async carregarUsuarios(): Promise<void> {
    this.usuarios.set(await this.authService.listarUsuarios(this.sessao()!.role));
  }
}
