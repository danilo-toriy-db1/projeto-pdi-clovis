import { Component, computed, inject, input, output, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  EstadoFeedback,
  FeedbackModal,
} from '../../../shared/components/feedback-modal/feedback-modal';
import { IntentLogin } from '../../../shared/models/enums/intent-login.enum';
import { ResultadoAutenticacao } from '../../../shared/models/enums/resultado-autenticacao.enum';
import { Role } from '../../../shared/models/enums/role.enum';
import { AuthService } from '../../../shared/services/auth.service/auth.service';
import { ThemeService } from '../../../shared/services/theme.service/theme.service';

type EstadoLoginModal = 'formulario' | 'carregando' | ResultadoAutenticacao;

const MENSAGEM_POR_RESULTADO: Record<ResultadoAutenticacao, string> = {
  [ResultadoAutenticacao.USUARIO_NAO_ENCONTRADO]: 'Usuário Não Encontrado.',
  [ResultadoAutenticacao.CREDENCIAIS_INVALIDAS]: 'Credenciais Inválidas.',
  [ResultadoAutenticacao.ACESSO_NEGADO]:
    'Acesso Negado: esta conta não tem permissão de administrador.',
  [ResultadoAutenticacao.SUCESSO]: 'Sucesso! Redirecionando…',
};

@Component({
  selector: 'app-login-modal',
  imports: [NgOptimizedImage, ReactiveFormsModule, FeedbackModal],
  templateUrl: './login-modal.html',
  styleUrl: './login-modal.scss',
})
export class LoginModal {
  private readonly authService = inject(AuthService);
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

  readonly intent = input.required<IntentLogin>();
  readonly fechar = output<void>();

  protected readonly Role = Role;
  protected readonly IntentLogin = IntentLogin;
  protected readonly temaEscuro = this.themeService.temaEscuro;

  protected readonly estado = signal<EstadoLoginModal>('formulario');
  protected readonly estadoFeedback = computed<EstadoFeedback | null>(() => {
    if (this.estado() === 'carregando') {
      return 'carregando';
    }

    if (this.estado() === ResultadoAutenticacao.SUCESSO) {
      return 'sucesso';
    }

    if (this.estado() === 'formulario') {
      return null;
    }

    return 'mensagem';
  });
  protected readonly mensagemFeedback = computed(
    () => MENSAGEM_POR_RESULTADO[this.estado() as ResultadoAutenticacao] ?? '',
  );
  protected readonly modoCriarConta = signal(false);
  protected readonly usuarioJaExiste = signal(false);
  protected readonly criacaoConcluida = signal(false);

  protected readonly formularioLogin = this.formBuilder.nonNullable.group({
    usuario: ['', Validators.required],
    senha: ['', Validators.required],
  });

  protected readonly formularioCriarConta = this.formBuilder.nonNullable.group({
    usuario: ['', Validators.required],
    senha: ['', Validators.required],
    role: [Role.USER, Validators.required],
  });

  protected async enviarLogin(): Promise<void> {
    if (this.formularioLogin.invalid) {
      return;
    }

    const { usuario, senha } = this.formularioLogin.getRawValue();
    this.estado.set('carregando');

    const [resultado] = await Promise.all([
      this.authService.autenticar(usuario, senha, this.intent()),
      this.authService.aguardarSimulacaoDeRede(),
    ]);

    this.estado.set(resultado.resultado);

    if (resultado.resultado === ResultadoAutenticacao.SUCESSO && resultado.destino) {
      await this.router.navigateByUrl(resultado.destino);
    }
  }

  protected abrirCriarConta(): void {
    this.modoCriarConta.set(true);
    this.criacaoConcluida.set(false);
    this.usuarioJaExiste.set(false);
    this.estado.set('formulario');
    this.formularioCriarConta.reset({ usuario: '', senha: '', role: Role.USER });
  }

  protected voltarParaLogin(): void {
    this.modoCriarConta.set(false);
    this.estado.set('formulario');
  }

  protected async enviarCriarConta(): Promise<void> {
    if (this.formularioCriarConta.invalid) {
      return;
    }

    const novoUsuario = this.formularioCriarConta.getRawValue();
    this.usuarioJaExiste.set(false);
    this.estado.set('carregando');

    const [criado] = await Promise.all([
      this.authService.criarUsuario(novoUsuario, null),
      this.authService.aguardarSimulacaoDeRede(),
    ]);

    this.estado.set('formulario');

    if (criado) {
      this.modoCriarConta.set(false);
      this.criacaoConcluida.set(true);
    } else {
      this.usuarioJaExiste.set(true);
    }
  }

  protected fecharModal(): void {
    this.fechar.emit();
  }
}
